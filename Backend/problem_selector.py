"""
Intelligent Problem Selection System
Implements IRT-based difficulty matching and skill gap analysis
"""

import math
import random
from datetime import datetime, timezone
from typing import List, Dict, Optional, Tuple
import numpy as np
from collections import defaultdict


class IRTModel:
    """Item Response Theory model for adaptive problem selection"""
    
    def __init__(self):
        self.default_ability = 0.0  # Standardized ability level (mean=0, std=1)
        self.convergence_threshold = 0.01
        self.max_iterations = 50
    
    def estimate_ability(self, responses: List[Dict]) -> float:
        """
        Estimate user ability using Maximum Likelihood Estimation
        
        Args:
            responses: List of user responses with problem difficulty and correctness
            
        Returns:
            Estimated ability level
        """
        if not responses:
            return self.default_ability
        
        # Initial ability estimate
        ability = self.default_ability
        
        for iteration in range(self.max_iterations):
            # Calculate first and second derivatives
            first_derivative = 0
            second_derivative = 0
            
            for response in responses:
                difficulty = response.get('difficulty', 0.0)
                correct = response.get('correct', False)
                
                # Probability of correct response given ability
                prob = self._probability_correct(ability, difficulty)
                
                # First derivative (score function)
                first_derivative += (1 if correct else 0) - prob
                
                # Second derivative (information function)
                second_derivative -= prob * (1 - prob)
            
            # Newton-Raphson update
            if abs(second_derivative) < 1e-10:
                break
                
            delta = first_derivative / abs(second_derivative)
            new_ability = ability + delta
            
            # Check convergence
            if abs(new_ability - ability) < self.convergence_threshold:
                ability = new_ability
                break
                
            ability = new_ability
        
        return ability
    
    def _probability_correct(self, ability: float, difficulty: float, 
                           discrimination: float = 1.0, guessing: float = 0.0) -> float:
        """
        Calculate probability of correct response using 3-parameter logistic model
        
        Args:
            ability: User ability level
            difficulty: Problem difficulty level
            discrimination: Problem discrimination parameter
            guessing: Probability of guessing correctly
            
        Returns:
            Probability of correct response
        """
        try:
            exponent = discrimination * (ability - difficulty)
            # Prevent overflow
            if exponent > 700:
                return 1.0 - guessing
            elif exponent < -700:
                return guessing
            
            prob = guessing + (1 - guessing) / (1 + math.exp(-exponent))
            return max(0.0, min(1.0, prob))
        except (OverflowError, ValueError):
            return 0.5


class SkillAnalyzer:
    """Analyzes user skills and identifies learning gaps"""
    
    def __init__(self):
        self.skill_categories = {
            'algorithms': ['sorting', 'searching', 'dynamic_programming', 'greedy', 'divide_conquer'],
            'data_structures': ['arrays', 'linked_lists', 'stacks', 'queues', 'trees', 'graphs', 'heaps'],
            'programming_fundamentals': ['loops', 'conditionals', 'functions', 'recursion', 'string_manipulation'],
            'mathematics': ['number_theory', 'combinatorics', 'probability', 'geometry'],
            'system_design': ['complexity_analysis', 'optimization', 'scalability']
        }
        
        self.skill_dependencies = {
            'dynamic_programming': ['recursion', 'arrays'],
            'graphs': ['data_structures', 'algorithms'],
            'trees': ['recursion', 'data_structures'],
            'heaps': ['arrays', 'trees'],
            'divide_conquer': ['recursion', 'algorithms']
        }
    
    def analyze_skill_gaps(self, user_progress: Dict) -> Dict[str, float]:
        """
        Analyze user's skill gaps based on performance history
        
        Args:
            user_progress: User's learning progress data
            
        Returns:
            Dictionary of skills and their mastery levels (0.0 to 1.0)
        """
        skill_scores = defaultdict(list)
        skill_mastery = {}
        
        # Analyze solved problems to extract skill performance
        solved_problems = user_progress.get('solved_problems', [])
        for problem in solved_problems:
            skills = problem.get('skills', [])
            score = problem.get('score', 0.0)
            
            for skill in skills:
                skill_scores[skill].append(score)
        
        # Calculate mastery levels
        for skill_category, skills in self.skill_categories.items():
            category_scores = []
            
            for skill in skills:
                if skill in skill_scores:
                    # Calculate weighted average with recency bias
                    scores = skill_scores[skill]
                    if scores:
                        # More recent attempts have higher weight
                        weights = [math.exp(-0.1 * i) for i in range(len(scores))]
                        weighted_avg = sum(s * w for s, w in zip(scores, weights)) / sum(weights)
                        category_scores.append(weighted_avg)
                else:
                    # No data for this skill
                    category_scores.append(0.0)
            
            # Calculate category mastery
            if category_scores:
                skill_mastery[skill_category] = sum(category_scores) / len(category_scores) / 100.0
            else:
                skill_mastery[skill_category] = 0.0
        
        return skill_mastery
    
    def identify_prerequisite_gaps(self, target_skill: str, current_mastery: Dict[str, float]) -> List[str]:
        """
        Identify prerequisite skills that need improvement before tackling target skill
        
        Args:
            target_skill: The skill user wants to learn
            current_mastery: Current mastery levels for all skills
            
        Returns:
            List of prerequisite skills that need improvement
        """
        gaps = []
        prerequisites = self.skill_dependencies.get(target_skill, [])
        
        for prereq in prerequisites:
            mastery_level = current_mastery.get(prereq, 0.0)
            if mastery_level < 0.6:  # Threshold for adequate mastery
                gaps.append(prereq)
        
        return gaps


class ProblemSelector:
    """Intelligent problem selection system"""
    
    def __init__(self, database_service, problems_data: List[Dict]):
        self.database_service = database_service
        self.problems_data = problems_data
        self.irt_model = IRTModel()
        self.skill_analyzer = SkillAnalyzer()
        
        # Index problems by difficulty and skills
        self._index_problems()
    
    def _index_problems(self):
        """Create indexes for efficient problem retrieval"""
        self.problems_by_difficulty = defaultdict(list)
        self.problems_by_skill = defaultdict(list)
        
        for problem in self.problems_data:
            difficulty = problem.get('difficulty', 'medium')
            skills = problem.get('skills', [])
            
            self.problems_by_difficulty[difficulty].append(problem)
            
            for skill in skills:
                self.problems_by_skill[skill].append(problem)
    
    def select_adaptive_problems(self, user_id: str, count: int = 5) -> List[Dict]:
        """
        Select problems adaptively based on user's ability and skill gaps
        
        Args:
            user_id: User identifier
            count: Number of problems to select
            
        Returns:
            List of selected problems with reasoning
        """
        # Get user's learning history
        user_progress = self.database_service.get_user_progress(user_id)
        user_responses = self._extract_user_responses(user_id)
        
        # Estimate current ability level
        estimated_ability = self.irt_model.estimate_ability(user_responses)
        
        # Analyze skill gaps
        skill_mastery = self.skill_analyzer.analyze_skill_gaps(user_progress)
        
        # Select problems based on multiple criteria
        selected_problems = []
        
        # 1. Target optimal difficulty (slightly above current ability)
        target_difficulty = estimated_ability + 0.3
        difficulty_problems = self._select_by_difficulty(target_difficulty, count // 2)
        selected_problems.extend(difficulty_problems)
        
        # 2. Address skill gaps
        weak_skills = [skill for skill, mastery in skill_mastery.items() if mastery < 0.5]
        if weak_skills:
            skill_problems = self._select_by_skills(weak_skills, count - len(selected_problems))
            selected_problems.extend(skill_problems)
        
        # 3. Fill remaining slots with variety
        if len(selected_problems) < count:
            remaining = count - len(selected_problems)
            variety_problems = self._select_variety(user_id, remaining, exclude=selected_problems)
            selected_problems.extend(variety_problems)
        
        # Add selection reasoning
        for problem in selected_problems:
            problem['selection_reason'] = self._generate_selection_reason(
                problem, estimated_ability, skill_mastery
            )
        
        return selected_problems[:count]
    
    def _extract_user_responses(self, user_id: str) -> List[Dict]:
        """Extract user response data for IRT analysis"""
        try:
            # Get recent evaluations
            evaluations = list(self.database_service.db.evaluations.find(
                {"user_id": user_id},
                sort=[("timestamp", -1)],
                limit=50
            ))
            
            responses = []
            for eval_data in evaluations:
                difficulty_map = {'easy': -1.0, 'medium': 0.0, 'hard': 1.0}
                problem_difficulty = eval_data.get('problem_difficulty', 'medium')
                
                response = {
                    'difficulty': difficulty_map.get(problem_difficulty, 0.0),
                    'correct': eval_data.get('all_passed', False),
                    'score': eval_data.get('scores', {}).get('overall', 0),
                    'timestamp': eval_data.get('timestamp', datetime.now(timezone.utc))
                }
                responses.append(response)
            
            return responses
        except Exception as e:
            print(f"Error extracting user responses: {e}")
            return []
    
    def _select_by_difficulty(self, target_difficulty: float, count: int) -> List[Dict]:
        """Select problems based on target difficulty level"""
        # Map continuous difficulty to discrete categories
        if target_difficulty < -0.5:
            difficulty_category = 'easy'
        elif target_difficulty > 0.5:
            difficulty_category = 'hard'
        else:
            difficulty_category = 'medium'
        
        available_problems = self.problems_by_difficulty.get(difficulty_category, [])
        
        # Randomly select from available problems
        if len(available_problems) <= count:
            return available_problems.copy()
        else:
            return random.sample(available_problems, count)
    
    def _select_by_skills(self, target_skills: List[str], count: int) -> List[Dict]:
        """Select problems that target specific skills"""
        skill_problems = []
        
        for skill in target_skills:
            if len(skill_problems) >= count:
                break
                
            available = self.problems_by_skill.get(skill, [])
            if available:
                # Select one problem per skill
                problem = random.choice(available)
                if problem not in skill_problems:
                    skill_problems.append(problem)
        
        return skill_problems[:count]
    
    def _select_variety(self, user_id: str, count: int, exclude: List[Dict]) -> List[Dict]:
        """Select variety of problems avoiding duplicates"""
        # Get previously solved problems
        user_progress = self.database_service.get_user_progress(user_id)
        solved_ids = {p.get('problem_id') for p in user_progress.get('solved_problems', [])}
        exclude_ids = {p.get('id') for p in exclude}
        
        # Filter available problems
        available = [
            p for p in self.problems_data 
            if p.get('id') not in solved_ids and p.get('id') not in exclude_ids
        ]
        
        if len(available) <= count:
            return available
        else:
            return random.sample(available, count)
    
    def _generate_selection_reason(self, problem: Dict, ability: float, 
                                 skill_mastery: Dict[str, float]) -> str:
        """Generate human-readable reason for problem selection"""
        reasons = []
        
        # Difficulty-based reasoning
        difficulty = problem.get('difficulty', 'medium')
        if difficulty == 'easy' and ability < 0:
            reasons.append("Building confidence with foundational concepts")
        elif difficulty == 'hard' and ability > 0.5:
            reasons.append("Challenging problem to push your limits")
        else:
            reasons.append("Optimal difficulty for your current skill level")
        
        # Skill-based reasoning
        problem_skills = problem.get('skills', [])
        weak_skills = [skill for skill in problem_skills if skill_mastery.get(skill, 0) < 0.5]
        
        if weak_skills:
            reasons.append(f"Targets improvement areas: {', '.join(weak_skills)}")
        
        return "; ".join(reasons)
    
    def get_learning_path(self, user_id: str, target_skill: str) -> List[Dict]:
        """
        Generate a personalized learning path for a specific skill
        
        Args:
            user_id: User identifier
            target_skill: Skill to focus on
            
        Returns:
            Ordered list of problems forming a learning path
        """
        user_progress = self.database_service.get_user_progress(user_id)
        skill_mastery = self.skill_analyzer.analyze_skill_gaps(user_progress)
        
        # Check for prerequisite gaps
        prereq_gaps = self.skill_analyzer.identify_prerequisite_gaps(target_skill, skill_mastery)
        
        learning_path = []
        
        # First, address prerequisite gaps
        for prereq in prereq_gaps:
            prereq_problems = self.problems_by_skill.get(prereq, [])
            if prereq_problems:
                # Select easy to medium problems for prerequisites
                easy_prereqs = [p for p in prereq_problems if p.get('difficulty') in ['easy', 'medium']]
                if easy_prereqs:
                    learning_path.extend(random.sample(easy_prereqs, min(2, len(easy_prereqs))))
        
        # Then, add problems for the target skill
        target_problems = self.problems_by_skill.get(target_skill, [])
        if target_problems:
            # Progressive difficulty
            for difficulty in ['easy', 'medium', 'hard']:
                difficulty_problems = [p for p in target_problems if p.get('difficulty') == difficulty]
                if difficulty_problems:
                    learning_path.extend(random.sample(difficulty_problems, min(2, len(difficulty_problems))))
        
        # Add learning path metadata
        for i, problem in enumerate(learning_path):
            problem['path_position'] = i + 1
            problem['path_total'] = len(learning_path)
            
            if i < len(prereq_gaps) * 2:
                problem['path_type'] = 'prerequisite'
            else:
                problem['path_type'] = 'target_skill'
        
        return learning_path
    
    def get_recommendation_stats(self, user_id: str) -> Dict:
        """Get statistics about user's learning progress and recommendations"""
        user_progress = self.database_service.get_user_progress(user_id)
        user_responses = self._extract_user_responses(user_id)
        
        # Calculate statistics
        estimated_ability = self.irt_model.estimate_ability(user_responses)
        skill_mastery = self.skill_analyzer.analyze_skill_gaps(user_progress)
        
        total_problems = len(self.problems_data)
        solved_count = len(user_progress.get('solved_problems', []))
        
        # Calculate learning velocity (problems solved per day)
        recent_evaluations = user_responses[-10:] if user_responses else []
        if len(recent_evaluations) >= 2:
            time_span = (recent_evaluations[0]['timestamp'] - recent_evaluations[-1]['timestamp']).days
            velocity = len(recent_evaluations) / max(time_span, 1)
        else:
            velocity = 0.0
        
        return {
            'estimated_ability': round(estimated_ability, 2),
            'skill_mastery': {k: round(v, 2) for k, v in skill_mastery.items()},
            'completion_rate': round(solved_count / total_problems * 100, 1) if total_problems > 0 else 0,
            'total_solved': solved_count,
            'total_available': total_problems,
            'learning_velocity': round(velocity, 2),
            'weak_skills': [skill for skill, mastery in skill_mastery.items() if mastery < 0.4],
            'strong_skills': [skill for skill, mastery in skill_mastery.items() if mastery > 0.7]
        }