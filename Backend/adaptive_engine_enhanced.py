"""
Enhanced Adaptive Engine - Phase 3: Dynamic Difficulty Progression
Implements advanced adaptive algorithms with real-time difficulty adjustment
"""

import math
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import statistics
from collections import defaultdict, deque
from database_service import db_service
from learning_analytics import LearningAnalytics

@dataclass
class DifficultyState:
    """Tracks user's current difficulty state"""
    user_id: str
    current_difficulty: float  # 0.0 to 1.0 scale
    confidence_level: float    # How confident we are in this difficulty
    last_adjustments: List[float]  # Recent difficulty changes
    performance_buffer: deque  # Recent performance scores
    adaptation_rate: float     # How quickly to adapt difficulty
    challenge_tolerance: float # User's tolerance for challenge
    success_target: float      # Target success rate (0.6-0.8)
    last_updated: datetime
    
    def __post_init__(self):
        if not hasattr(self, 'performance_buffer') or self.performance_buffer is None:
            self.performance_buffer = deque(maxlen=10)
        if not hasattr(self, 'last_adjustments') or self.last_adjustments is None:
            self.last_adjustments = []

@dataclass
class AdaptationEvent:
    """Records a difficulty adaptation event"""
    user_id: str
    timestamp: datetime
    old_difficulty: float
    new_difficulty: float
    trigger_reason: str
    performance_data: Dict[str, float]
    confidence_before: float
    confidence_after: float

@dataclass
class PerformanceMetrics:
    """Comprehensive performance metrics"""
    success_rate: float
    average_attempts: float
    time_efficiency: float
    error_rate: float
    learning_velocity: float
    consistency_score: float
    challenge_engagement: float
    frustration_indicators: float

class EnhancedAdaptiveEngine:
    """Enhanced adaptive engine with dynamic difficulty progression"""
    
    def __init__(self):
        self.db = db_service.db
        self.analytics = LearningAnalytics()
        self.difficulty_states = {}
        self.adaptation_history = []
        
        # Configuration parameters
        self.config = {
            'min_samples_for_adaptation': 5,
            'adaptation_sensitivity': 0.15,
            'max_difficulty_change': 0.2,
            'success_rate_target': 0.7,
            'success_rate_tolerance': 0.1,
            'confidence_threshold': 0.6,
            'performance_window_size': 10,
            'challenge_boost_threshold': 0.85,
            'support_boost_threshold': 0.45
        }
    
    def get_difficulty_state(self, user_id: str) -> DifficultyState:
        """Get or create difficulty state for user"""
        if user_id not in self.difficulty_states:
            # Load from database or create new
            saved_state = self.db.difficulty_states.find_one({'user_id': user_id})
            
            if saved_state:
                self.difficulty_states[user_id] = DifficultyState(
                    user_id=saved_state['user_id'],
                    current_difficulty=saved_state['current_difficulty'],
                    confidence_level=saved_state['confidence_level'],
                    last_adjustments=saved_state.get('last_adjustments', []),
                    performance_buffer=deque(saved_state.get('performance_buffer', []), maxlen=10),
                    adaptation_rate=saved_state.get('adaptation_rate', 0.1),
                    challenge_tolerance=saved_state.get('challenge_tolerance', 0.6),
                    success_target=saved_state.get('success_target', 0.7),
                    last_updated=datetime.fromisoformat(saved_state['last_updated'])
                )
            else:
                # Create new state
                self.difficulty_states[user_id] = DifficultyState(
                    user_id=user_id,
                    current_difficulty=0.3,  # Start at easy-medium
                    confidence_level=0.5,
                    last_adjustments=[],
                    performance_buffer=deque(maxlen=10),
                    adaptation_rate=0.1,
                    challenge_tolerance=0.6,
                    success_target=0.7,
                    last_updated=datetime.now()
                )
        
        return self.difficulty_states[user_id]
    
    def save_difficulty_state(self, user_id: str):
        """Save difficulty state to database"""
        state = self.difficulty_states.get(user_id)
        if not state:
            return
        
        state_dict = {
            'user_id': user_id,
            'current_difficulty': state.current_difficulty,
            'confidence_level': state.confidence_level,
            'last_adjustments': state.last_adjustments[-20:],  # Keep last 20
            'performance_buffer': list(state.performance_buffer),
            'adaptation_rate': state.adaptation_rate,
            'challenge_tolerance': state.challenge_tolerance,
            'success_target': state.success_target,
            'last_updated': state.last_updated.isoformat()
        }
        
        self.db.difficulty_states.update_one(
            {'user_id': user_id},
            {'$set': state_dict},
            upsert=True
        )
    
    def calculate_performance_metrics(self, user_id: str, window_size: int = 10) -> PerformanceMetrics:
        """Calculate comprehensive performance metrics"""
        # Get recent submissions
        recent_submissions = list(self.db.evaluations.find({
            'user_id': user_id
        }).sort('submission_time', -1).limit(window_size))
        
        if not recent_submissions:
            return PerformanceMetrics(0.5, 1.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.5)
        
        # Calculate metrics
        success_count = sum(1 for s in recent_submissions if s.get('all_passed', False))
        success_rate = success_count / len(recent_submissions)
        
        # Average attempts per problem
        problem_attempts = defaultdict(int)
        for submission in recent_submissions:
            problem_id = submission.get('problem_id')
            problem_attempts[problem_id] += 1
        
        average_attempts = statistics.mean(problem_attempts.values()) if problem_attempts else 1.0
        
        # Time efficiency (problems solved per minute)
        total_time = sum(s.get('time_spent_seconds', 300) for s in recent_submissions) / 60
        time_efficiency = len(recent_submissions) / max(total_time, 1)
        
        # Error rate
        total_errors = sum(len(s.get('results', [])) - sum(1 for r in s.get('results', []) if r.get('passed', False)) 
                          for s in recent_submissions)
        total_tests = sum(len(s.get('results', [])) for s in recent_submissions)
        error_rate = total_errors / max(total_tests, 1)
        
        # Learning velocity (improvement over time)
        if len(recent_submissions) >= 5:
            early_success = sum(1 for s in recent_submissions[-5:] if s.get('all_passed', False)) / 5
            recent_success = sum(1 for s in recent_submissions[:5] if s.get('all_passed', False)) / 5
            learning_velocity = recent_success - early_success
        else:
            learning_velocity = 0.0
        
        # Consistency (variance in performance)
        success_scores = [1.0 if s.get('all_passed', False) else 0.0 for s in recent_submissions]
        consistency_score = 1.0 - statistics.stdev(success_scores) if len(success_scores) > 1 else 1.0
        
        # Challenge engagement (harder problems attempted)
        difficulties = [s.get('difficulty_score', 0.5) for s in recent_submissions]
        avg_difficulty = statistics.mean(difficulties) if difficulties else 0.5
        challenge_engagement = min(1.0, avg_difficulty / 0.7)  # Normalize to 0.7 as "good challenge"
        
        # Frustration indicators (multiple failed attempts, giving up)
        frustration_score = 0.0
        if average_attempts > 3:
            frustration_score += 0.3
        if success_rate < 0.3:
            frustration_score += 0.4
        if error_rate > 0.7:
            frustration_score += 0.3
        
        return PerformanceMetrics(
            success_rate=success_rate,
            average_attempts=average_attempts,
            time_efficiency=min(1.0, time_efficiency / 0.1),  # Normalize
            error_rate=error_rate,
            learning_velocity=max(-1.0, min(1.0, learning_velocity)),
            consistency_score=max(0.0, min(1.0, consistency_score)),
            challenge_engagement=challenge_engagement,
            frustration_indicators=min(1.0, frustration_score)
        )
    
    def should_adapt_difficulty(self, user_id: str, performance: PerformanceMetrics) -> Tuple[bool, str]:
        """Determine if difficulty should be adapted"""
        state = self.get_difficulty_state(user_id)
        
        # Check if we have enough data
        if len(state.performance_buffer) < self.config['min_samples_for_adaptation']:
            return False, "Insufficient data"
        
        # Check success rate deviation from target
        success_deviation = abs(performance.success_rate - state.success_target)
        
        if success_deviation > self.config['success_rate_tolerance']:
            if performance.success_rate > state.success_target + self.config['success_rate_tolerance']:
                return True, "Success rate too high - increase difficulty"
            else:
                return True, "Success rate too low - decrease difficulty"
        
        # Check for frustration indicators
        if performance.frustration_indicators > 0.7:
            return True, "High frustration detected - decrease difficulty"
        
        # Check for under-challenge
        if (performance.success_rate > 0.85 and 
            performance.challenge_engagement < 0.5 and
            performance.average_attempts < 1.5):
            return True, "Under-challenged - increase difficulty"
        
        # Check learning velocity
        if performance.learning_velocity < -0.2:
            return True, "Negative learning velocity - decrease difficulty"
        
        return False, "No adaptation needed"
    
    def calculate_difficulty_adjustment(self, user_id: str, performance: PerformanceMetrics, reason: str) -> float:
        """Calculate the appropriate difficulty adjustment"""
        state = self.get_difficulty_state(user_id)
        
        base_adjustment = 0.0
        
        # Calculate adjustment based on reason
        if "increase difficulty" in reason.lower():
            # Increase difficulty
            success_excess = performance.success_rate - state.success_target
            base_adjustment = min(success_excess * 0.5, self.config['max_difficulty_change'])
            
            # Boost if user is highly engaged and consistent
            if performance.challenge_engagement > 0.7 and performance.consistency_score > 0.7:
                base_adjustment *= 1.2
                
        elif "decrease difficulty" in reason.lower():
            # Decrease difficulty
            if "frustration" in reason.lower():
                base_adjustment = -min(0.15, performance.frustration_indicators * 0.2)
            else:
                success_deficit = state.success_target - performance.success_rate
                base_adjustment = -min(success_deficit * 0.7, self.config['max_difficulty_change'])
        
        # Apply adaptation rate
        base_adjustment *= state.adaptation_rate
        
        # Apply confidence modifier
        confidence_modifier = 0.5 + (state.confidence_level * 0.5)
        base_adjustment *= confidence_modifier
        
        # Ensure bounds
        new_difficulty = state.current_difficulty + base_adjustment
        new_difficulty = max(0.05, min(0.95, new_difficulty))
        
        return new_difficulty - state.current_difficulty
    
    def adapt_difficulty(self, user_id: str) -> Dict[str, Any]:
        """Perform difficulty adaptation for user"""
        state = self.get_difficulty_state(user_id)
        performance = self.calculate_performance_metrics(user_id)
        
        # Add performance to buffer
        performance_score = self._calculate_composite_performance_score(performance)
        state.performance_buffer.append(performance_score)
        
        # Check if adaptation is needed
        should_adapt, reason = self.should_adapt_difficulty(user_id, performance)
        
        adaptation_result = {
            'user_id': user_id,
            'adaptation_performed': False,
            'old_difficulty': state.current_difficulty,
            'new_difficulty': state.current_difficulty,
            'reason': reason,
            'performance_metrics': asdict(performance),
            'confidence_level': state.confidence_level
        }
        
        if should_adapt:
            old_difficulty = state.current_difficulty
            adjustment = self.calculate_difficulty_adjustment(user_id, performance, reason)
            
            # Apply adjustment
            state.current_difficulty += adjustment
            state.current_difficulty = max(0.05, min(0.95, state.current_difficulty))
            
            # Update confidence based on consistency of recent adaptations
            state.last_adjustments.append(adjustment)
            if len(state.last_adjustments) > 5:
                state.last_adjustments = state.last_adjustments[-5:]
            
            # Calculate confidence
            if len(state.last_adjustments) >= 3:
                adjustment_consistency = 1.0 - statistics.stdev([abs(a) for a in state.last_adjustments[-3:]])
                state.confidence_level = min(1.0, state.confidence_level + adjustment_consistency * 0.1)
            
            # Update adaptation rate based on performance
            if performance.learning_velocity > 0:
                state.adaptation_rate = min(0.2, state.adaptation_rate * 1.05)
            else:
                state.adaptation_rate = max(0.05, state.adaptation_rate * 0.95)
            
            state.last_updated = datetime.now()
            
            # Record adaptation event
            event = AdaptationEvent(
                user_id=user_id,
                timestamp=datetime.now(),
                old_difficulty=old_difficulty,
                new_difficulty=state.current_difficulty,
                trigger_reason=reason,
                performance_data=asdict(performance),
                confidence_before=state.confidence_level - 0.1,
                confidence_after=state.confidence_level
            )
            
            self.adaptation_history.append(event)
            
            # Save to database
            self._save_adaptation_event(event)
            self.save_difficulty_state(user_id)
            
            adaptation_result.update({
                'adaptation_performed': True,
                'new_difficulty': state.current_difficulty,
                'adjustment_amount': adjustment,
                'confidence_level': state.confidence_level
            })
        
        return adaptation_result
    
    def _calculate_composite_performance_score(self, performance: PerformanceMetrics) -> float:
        """Calculate a single composite performance score"""
        weights = {
            'success_rate': 0.3,
            'time_efficiency': 0.15,
            'learning_velocity': 0.2,
            'consistency_score': 0.15,
            'challenge_engagement': 0.1,
            'frustration_penalty': -0.1
        }
        
        score = (weights['success_rate'] * performance.success_rate +
                weights['time_efficiency'] * performance.time_efficiency +
                weights['learning_velocity'] * (performance.learning_velocity + 1) / 2 +  # Normalize to 0-1
                weights['consistency_score'] * performance.consistency_score +
                weights['challenge_engagement'] * performance.challenge_engagement +
                weights['frustration_penalty'] * performance.frustration_indicators)
        
        return max(0.0, min(1.0, score))
    
    def _save_adaptation_event(self, event: AdaptationEvent):
        """Save adaptation event to database"""
        event_dict = {
            'user_id': event.user_id,
            'timestamp': event.timestamp.isoformat(),
            'old_difficulty': event.old_difficulty,
            'new_difficulty': event.new_difficulty,
            'trigger_reason': event.trigger_reason,
            'performance_data': event.performance_data,
            'confidence_before': event.confidence_before,
            'confidence_after': event.confidence_after
        }
        
        self.db.adaptation_events.insert_one(event_dict)
    
    def get_optimal_problem_difficulty(self, user_id: str, concept: str = None) -> float:
        """Get optimal problem difficulty for user"""
        state = self.get_difficulty_state(user_id)
        base_difficulty = state.current_difficulty
        
        # Adjust based on concept mastery if provided
        if concept:
            concept_mastery = self._get_concept_mastery(user_id, concept)
            
            # Adjust difficulty based on concept-specific performance
            if concept_mastery > 0.8:
                base_difficulty = min(0.9, base_difficulty + 0.1)
            elif concept_mastery < 0.4:
                base_difficulty = max(0.1, base_difficulty - 0.1)
        
        return base_difficulty
    
    def _get_concept_mastery(self, user_id: str, concept: str) -> float:
        """Get user's mastery level for specific concept"""
        # Get recent submissions for this concept
        recent_submissions = list(self.db.evaluations.find({
            'user_id': user_id,
            'concepts': concept
        }).sort('submission_time', -1).limit(10))
        
        if not recent_submissions:
            return 0.5  # Default middle mastery
        
        success_count = sum(1 for s in recent_submissions if s.get('all_passed', False))
        return success_count / len(recent_submissions)
    
    def get_difficulty_progression_plan(self, user_id: str, target_concepts: List[str]) -> Dict[str, Any]:
        """Generate a difficulty progression plan for specific concepts"""
        state = self.get_difficulty_state(user_id)
        current_performance = self.calculate_performance_metrics(user_id)
        
        plan = {
            'current_level': state.current_difficulty,
            'target_level': min(0.9, state.current_difficulty + 0.3),
            'progression_steps': [],
            'estimated_timeline': 0,
            'key_milestones': []
        }
        
        # Calculate progression steps
        current_diff = state.current_difficulty
        target_diff = plan['target_level']
        step_size = 0.05
        
        while current_diff < target_diff:
            next_diff = min(target_diff, current_diff + step_size)
            
            step = {
                'difficulty': next_diff,
                'focus_concepts': target_concepts[:2],  # Focus on 2 concepts at a time
                'estimated_problems': int(10 + (next_diff * 20)),  # More problems for higher difficulty
                'success_criteria': {
                    'min_success_rate': 0.7,
                    'min_problems_solved': int(7 + (next_diff * 14))
                }
            }
            
            plan['progression_steps'].append(step)
            current_diff = next_diff
        
        # Estimate timeline (days)
        total_problems = sum(step['estimated_problems'] for step in plan['progression_steps'])
        problems_per_day = max(3, int(current_performance.time_efficiency * 10))
        plan['estimated_timeline'] = total_problems / problems_per_day
        
        # Key milestones
        milestones = [0.3, 0.5, 0.7, 0.9]
        for milestone in milestones:
            if milestone > state.current_difficulty and milestone <= target_diff:
                plan['key_milestones'].append({
                    'difficulty': milestone,
                    'description': self._get_milestone_description(milestone),
                    'reward': self._get_milestone_reward(milestone)
                })
        
        return plan
    
    def _get_milestone_description(self, difficulty: float) -> str:
        """Get description for difficulty milestone"""
        if difficulty <= 0.3:
            return "Mastered basic programming concepts"
        elif difficulty <= 0.5:
            return "Comfortable with intermediate problem solving"
        elif difficulty <= 0.7:
            return "Proficient in advanced algorithms and data structures"
        else:
            return "Expert-level problem solving skills"
    
    def _get_milestone_reward(self, difficulty: float) -> str:
        """Get reward suggestion for milestone"""
        rewards = [
            "Beginner Badge",
            "Intermediate Achiever",
            "Advanced Problem Solver",
            "Expert Coder"
        ]
        
        index = min(len(rewards) - 1, int(difficulty * len(rewards)))
        return rewards[index]
    
    def get_adaptation_insights(self, user_id: str) -> Dict[str, Any]:
        """Get insights about user's adaptation history"""
        # Get recent adaptation events
        recent_events = list(self.db.adaptation_events.find({
            'user_id': user_id
        }).sort('timestamp', -1).limit(20))
        
        if not recent_events:
            return {'message': 'No adaptation history available'}
        
        insights = {
            'total_adaptations': len(recent_events),
            'difficulty_trend': self._analyze_difficulty_trend(recent_events),
            'adaptation_frequency': self._calculate_adaptation_frequency(recent_events),
            'most_common_triggers': self._get_common_triggers(recent_events),
            'confidence_progression': self._analyze_confidence_progression(recent_events),
            'recommendations': []
        }
        
        # Generate recommendations based on insights
        if insights['adaptation_frequency'] > 0.8:
            insights['recommendations'].append("Your difficulty is adapting very frequently. This indicates good personalization.")
        elif insights['adaptation_frequency'] < 0.2:
            insights['recommendations'].append("Difficulty adaptations are rare. Consider challenging yourself more.")
        
        if insights['difficulty_trend'] > 0.1:
            insights['recommendations'].append("Your difficulty level is steadily increasing - excellent progress!")
        elif insights['difficulty_trend'] < -0.1:
            insights['recommendations'].append("Difficulty has been decreasing. Focus on building confidence with current level.")
        
        return insights
    
    def _analyze_difficulty_trend(self, events: List[Dict]) -> float:
        """Analyze overall difficulty trend"""
        if len(events) < 2:
            return 0.0
        
        difficulties = [event['new_difficulty'] for event in reversed(events)]
        
        # Simple linear trend
        x = list(range(len(difficulties)))
        correlation = np.corrcoef(x, difficulties)[0, 1] if len(difficulties) > 1 else 0
        
        return correlation * (difficulties[-1] - difficulties[0])
    
    def _calculate_adaptation_frequency(self, events: List[Dict]) -> float:
        """Calculate how frequently adaptations occur"""
        if len(events) < 2:
            return 0.0
        
        # Calculate average time between adaptations
        timestamps = [datetime.fromisoformat(event['timestamp']) for event in events]
        time_diffs = [(timestamps[i] - timestamps[i+1]).days for i in range(len(timestamps)-1)]
        
        avg_days_between = statistics.mean(time_diffs) if time_diffs else 7
        
        # Convert to frequency (adaptations per week)
        return min(1.0, 7 / max(avg_days_between, 1))
    
    def _get_common_triggers(self, events: List[Dict]) -> List[Tuple[str, int]]:
        """Get most common adaptation triggers"""
        triggers = [event['trigger_reason'] for event in events]
        trigger_counts = defaultdict(int)
        
        for trigger in triggers:
            trigger_counts[trigger] += 1
        
        return sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    
    def _analyze_confidence_progression(self, events: List[Dict]) -> Dict[str, float]:
        """Analyze how confidence has progressed"""
        if not events:
            return {'trend': 0.0, 'current': 0.5, 'stability': 0.5}
        
        confidences = [event['confidence_after'] for event in reversed(events)]
        
        trend = (confidences[-1] - confidences[0]) / len(confidences) if len(confidences) > 1 else 0
        current = confidences[-1] if confidences else 0.5
        stability = 1.0 - statistics.stdev(confidences) if len(confidences) > 1 else 0.5
        
        return {
            'trend': trend,
            'current': current,
            'stability': max(0.0, min(1.0, stability))
        }