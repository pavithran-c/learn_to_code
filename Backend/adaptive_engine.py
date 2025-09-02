"""
Adaptive Learning Engine - Core algorithms for personalized question selection
Implements IRT (Item Response Theory), BKT (Bayesian Knowledge Tracing), and Elo rating
"""

import math
import numpy as np
import json
import time
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta

@dataclass
class UserSkill:
    """User skill profile with multiple tracking methods"""
    user_id: str
    theta: float = 0.0  # IRT ability parameter
    theta_se: float = 1.0  # Standard error of theta
    elo_rating: float = 1500.0  # Elo rating
    concept_mastery: Dict[str, float] = None  # BKT mastery scores
    total_attempts: int = 0
    correct_attempts: int = 0
    last_updated: str = ""
    
    def __post_init__(self):
        if self.concept_mastery is None:
            self.concept_mastery = {}
        if not self.last_updated:
            self.last_updated = datetime.now().isoformat()

@dataclass
class ItemParameters:
    """Question/problem parameters for IRT and Elo"""
    item_id: str
    difficulty: float = 0.0  # IRT difficulty parameter (b)
    discrimination: float = 1.0  # IRT discrimination parameter (a)
    elo_rating: float = 1500.0  # Elo rating for the item
    concepts: List[str] = None  # Associated concepts for BKT
    exposure_count: int = 0  # How many times used
    last_calibrated: str = ""
    
    def __post_init__(self):
        if self.concepts is None:
            self.concepts = []
        if not self.last_calibrated:
            self.last_calibrated = datetime.now().isoformat()

@dataclass
class AttemptRecord:
    """Record of a user's attempt on an item"""
    user_id: str
    item_id: str
    score: float  # 0.0 to 1.0 (can be partial credit)
    binary_score: int  # 0 or 1 for IRT
    time_taken: int  # seconds
    timestamp: str
    hints_used: int = 0
    code_quality_signals: Dict = None  # For coding problems
    
    def __post_init__(self):
        if self.code_quality_signals is None:
            self.code_quality_signals = {}

class AdaptiveLearningEngine:
    """Main adaptive learning engine with multiple algorithms"""
    
    def __init__(self):
        self.user_skills: Dict[str, UserSkill] = {}
        self.item_params: Dict[str, ItemParameters] = {}
        self.attempt_history: List[AttemptRecord] = []
        
        # BKT parameters
        self.bkt_params = {
            'learn': 0.3,    # Probability of learning
            'slip': 0.1,     # Probability of slip (know but get wrong)
            'guess': 0.25,   # Probability of guess (don't know but get right)
            'forget': 0.05   # Probability of forgetting
        }
        
        # Elo K-factor
        self.elo_k = 32
        
    def get_or_create_user(self, user_id: str) -> UserSkill:
        """Get existing user or create new one"""
        if user_id not in self.user_skills:
            self.user_skills[user_id] = UserSkill(user_id=user_id)
        return self.user_skills[user_id]
    
    def get_or_create_item(self, item_id: str, concepts: List[str] = None) -> ItemParameters:
        """Get existing item or create new one"""
        if item_id not in self.item_params:
            self.item_params[item_id] = ItemParameters(
                item_id=item_id, 
                concepts=concepts or []
            )
        return self.item_params[item_id]
    
    def irt_probability(self, theta: float, difficulty: float, discrimination: float = 1.0) -> float:
        """Calculate probability of correct response using 2PL IRT model"""
        try:
            exponent = -discrimination * (theta - difficulty)
            return 1.0 / (1.0 + math.exp(exponent))
        except OverflowError:
            return 0.0 if theta < difficulty else 1.0
    
    def item_information(self, theta: float, difficulty: float, discrimination: float = 1.0) -> float:
        """Calculate item information at given theta"""
        p = self.irt_probability(theta, difficulty, discrimination)
        return (discrimination ** 2) * p * (1 - p)
    
    def update_theta_eap(self, user: UserSkill, responses: List[Tuple[float, float, int]]) -> None:
        """Update theta using Expected A Posteriori (EAP) estimation"""
        # Create theta grid for numerical integration
        theta_grid = np.linspace(-4, 4, 81)
        prior = np.exp(-0.5 * theta_grid**2) / math.sqrt(2 * math.pi)  # Standard normal prior
        
        # Calculate likelihood for each theta value
        likelihood = np.ones_like(theta_grid)
        for discrimination, difficulty, correct in responses:
            p_correct = 1.0 / (1.0 + np.exp(-discrimination * (theta_grid - difficulty)))
            likelihood *= np.where(correct, p_correct, 1 - p_correct)
        
        # Calculate posterior
        posterior = likelihood * prior
        posterior /= np.sum(posterior)
        
        # Calculate EAP estimate and standard error
        user.theta = np.sum(theta_grid * posterior)
        user.theta_se = math.sqrt(np.sum((theta_grid - user.theta)**2 * posterior))
        user.last_updated = datetime.now().isoformat()
    
    def update_elo_ratings(self, user: UserSkill, item: ItemParameters, score: float) -> None:
        """Update both user and item Elo ratings"""
        expected_user = 1.0 / (1.0 + 10**((item.elo_rating - user.elo_rating) / 400))
        expected_item = 1.0 - expected_user
        
        # Update ratings
        user.elo_rating += self.elo_k * (score - expected_user)
        item.elo_rating += self.elo_k * (expected_item - score)
        
        # Keep ratings in reasonable bounds
        user.elo_rating = max(800, min(2400, user.elo_rating))
        item.elo_rating = max(800, min(2400, item.elo_rating))
    
    def update_bkt_mastery(self, user: UserSkill, concepts: List[str], correct: bool) -> None:
        """Update Bayesian Knowledge Tracing mastery for concepts"""
        for concept in concepts:
            current_mastery = user.concept_mastery.get(concept, 0.2)  # Prior mastery
            
            # BKT update formula
            if correct:
                # P(L_n+1=1 | correct) = (P(L_n=1) * (1-slip) + P(L_n=0) * guess) / P(correct)
                p_correct = current_mastery * (1 - self.bkt_params['slip']) + \
                           (1 - current_mastery) * self.bkt_params['guess']
                p_mastery_given_correct = (current_mastery * (1 - self.bkt_params['slip'])) / p_correct
            else:
                # P(L_n+1=1 | incorrect)
                p_incorrect = current_mastery * self.bkt_params['slip'] + \
                             (1 - current_mastery) * (1 - self.bkt_params['guess'])
                p_mastery_given_correct = (current_mastery * self.bkt_params['slip']) / p_incorrect
            
            # Apply learning transition
            new_mastery = p_mastery_given_correct + \
                         (1 - p_mastery_given_correct) * self.bkt_params['learn']
            
            # Apply forgetting (optional)
            new_mastery *= (1 - self.bkt_params['forget'])
            
            user.concept_mastery[concept] = max(0.01, min(0.99, new_mastery))
    
    def select_next_item(self, user_id: str, available_items: List[str], 
                        content_constraints: Dict = None, max_exposure: float = 0.3) -> Optional[str]:
        """Select the most informative item for the user using CAT principles"""
        user = self.get_or_create_user(user_id)
        
        if not available_items:
            return None
        
        # Score each available item
        item_scores = []
        for item_id in available_items:
            item = self.get_or_create_item(item_id)
            
            # Skip if overexposed
            if item.exposure_count > 0:
                exposure_rate = item.exposure_count / max(1, len(self.attempt_history))
                if exposure_rate > max_exposure:
                    continue
            
            # Calculate information value
            information = self.item_information(user.theta, item.difficulty, item.discrimination)
            
            # Add concept mastery considerations
            concept_bonus = 0.0
            for concept in item.concepts:
                mastery = user.concept_mastery.get(concept, 0.5)
                if mastery < 0.7:  # Focus on weak concepts
                    concept_bonus += 0.1 * (0.7 - mastery)
            
            total_score = information + concept_bonus
            item_scores.append((total_score, item_id))
        
        if not item_scores:
            return available_items[0] if available_items else None
        
        # Sort by score and apply some randomness to top candidates
        item_scores.sort(reverse=True)
        top_k = min(3, len(item_scores))
        
        # Random selection from top-k to avoid overexposure
        import random
        selected_idx = random.randint(0, top_k - 1)
        return item_scores[selected_idx][1]
    
    def process_attempt(self, attempt: AttemptRecord) -> Dict:
        """Process a new attempt and update all models"""
        user = self.get_or_create_user(attempt.user_id)
        item = self.get_or_create_item(attempt.item_id)
        
        # Store attempt
        self.attempt_history.append(attempt)
        
        # Update user statistics
        user.total_attempts += 1
        if attempt.binary_score:
            user.correct_attempts += 1
        
        # Update IRT parameters
        recent_attempts = [
            (self.item_params[a.item_id].discrimination,
             self.item_params[a.item_id].difficulty,
             a.binary_score)
            for a in self.attempt_history
            if a.user_id == attempt.user_id
        ][-10:]  # Last 10 attempts for efficiency
        
        if len(recent_attempts) >= 3:  # Need minimum attempts for stable estimation
            self.update_theta_eap(user, recent_attempts)
        
        # Update Elo ratings
        self.update_elo_ratings(user, item, attempt.score)
        
        # Update BKT mastery
        self.update_bkt_mastery(user, item.concepts, attempt.binary_score == 1)
        
        # Update item exposure
        item.exposure_count += 1
        
        # Calculate stopping condition for adaptive testing
        stop_testing = user.theta_se < 0.3 or user.total_attempts >= 20
        
        return {
            'user_theta': user.theta,
            'user_theta_se': user.theta_se,
            'user_elo': user.elo_rating,
            'concept_mastery': user.concept_mastery.copy(),
            'stop_testing': stop_testing,
            'accuracy': user.correct_attempts / user.total_attempts if user.total_attempts > 0 else 0.0
        }
    
    def get_user_analytics(self, user_id: str) -> Dict:
        """Get comprehensive analytics for a user"""
        user = self.get_or_create_user(user_id)
        
        # Calculate percentile rank
        all_thetas = [u.theta for u in self.user_skills.values()]
        if len(all_thetas) > 1:
            percentile = sum(1 for t in all_thetas if t < user.theta) / len(all_thetas) * 100
        else:
            percentile = 50.0
        
        # Identify strengths and weaknesses
        strengths = []
        weaknesses = []
        for concept, mastery in user.concept_mastery.items():
            if mastery > 0.8:
                strengths.append({'concept': concept, 'mastery': mastery})
            elif mastery < 0.5:
                weaknesses.append({'concept': concept, 'mastery': mastery})
        
        strengths.sort(key=lambda x: x['mastery'], reverse=True)
        weaknesses.sort(key=lambda x: x['mastery'])
        
        return {
            'user_id': user_id,
            'ability_estimate': user.theta,
            'ability_se': user.theta_se,
            'elo_rating': user.elo_rating,
            'percentile_rank': percentile,
            'total_attempts': user.total_attempts,
            'accuracy': user.correct_attempts / user.total_attempts if user.total_attempts > 0 else 0.0,
            'strengths': strengths[:5],
            'weaknesses': weaknesses[:5],
            'overall_mastery': np.mean(list(user.concept_mastery.values())) if user.concept_mastery else 0.0,
            'last_updated': user.last_updated
        }
    
    def save_state(self, filepath: str) -> None:
        """Save current state to JSON file"""
        state = {
            'user_skills': {uid: asdict(user) for uid, user in self.user_skills.items()},
            'item_params': {iid: asdict(item) for iid, item in self.item_params.items()},
            'attempt_history': [asdict(attempt) for attempt in self.attempt_history],
            'bkt_params': self.bkt_params,
            'elo_k': self.elo_k
        }
        
        with open(filepath, 'w') as f:
            json.dump(state, f, indent=2)
    
    def load_state(self, filepath: str) -> None:
        """Load state from JSON file"""
        try:
            with open(filepath, 'r') as f:
                state = json.load(f)
            
            # Reconstruct objects
            self.user_skills = {
                uid: UserSkill(**data) for uid, data in state.get('user_skills', {}).items()
            }
            self.item_params = {
                iid: ItemParameters(**data) for iid, data in state.get('item_params', {}).items()
            }
            self.attempt_history = [
                AttemptRecord(**data) for data in state.get('attempt_history', [])
            ]
            self.bkt_params = state.get('bkt_params', self.bkt_params)
            self.elo_k = state.get('elo_k', self.elo_k)
            
        except FileNotFoundError:
            print(f"State file {filepath} not found. Starting with fresh state.")
        except Exception as e:
            print(f"Error loading state: {e}. Starting with fresh state.")

# Example usage and testing
if __name__ == "__main__":
    engine = AdaptiveLearningEngine()
    
    # Simulate some data
    engine.get_or_create_item("prob_1", ["arrays", "loops"])
    engine.get_or_create_item("prob_2", ["recursion", "dynamic_programming"])
    
    # Simulate attempts
    attempt1 = AttemptRecord("user_1", "prob_1", 0.8, 1, 45, datetime.now().isoformat())
    attempt2 = AttemptRecord("user_1", "prob_2", 0.3, 0, 120, datetime.now().isoformat())
    
    result1 = engine.process_attempt(attempt1)
    result2 = engine.process_attempt(attempt2)
    
    # Get analytics
    analytics = engine.get_user_analytics("user_1")
    print("User Analytics:", json.dumps(analytics, indent=2))
    
    # Select next item
    next_item = engine.select_next_item("user_1", ["prob_1", "prob_2", "prob_3"])
    print(f"Next recommended item: {next_item}")
