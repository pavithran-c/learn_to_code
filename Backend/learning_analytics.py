"""
Learning Analytics Engine - Phase 3: AI Recommendation System
Analyzes learning patterns, time spent, error types, and provides intelligent recommendations
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, asdict
import json
import statistics
from collections import defaultdict, Counter
import re
from database_service import db_service

@dataclass
class LearningSession:
    """Represents a single learning session"""
    user_id: str
    session_start: datetime
    session_end: datetime
    problems_attempted: List[str]
    problems_solved: List[str]
    total_time_spent: float  # in minutes
    average_time_per_problem: float
    errors_made: List[Dict]
    concepts_practiced: List[str]
    difficulty_progression: List[float]
    frustration_indicators: List[str]
    success_indicators: List[str]

@dataclass
class ErrorPattern:
    """Represents common error patterns"""
    error_type: str
    frequency: int
    concept_area: str
    difficulty_level: str
    example_codes: List[str]
    common_misconceptions: List[str]
    suggested_remediation: List[str]

@dataclass
class LearningInsight:
    """Individual learning insight"""
    insight_type: str  # 'strength', 'weakness', 'trend', 'recommendation'
    title: str
    description: str
    evidence: List[str]
    confidence_score: float
    action_items: List[str]
    priority: str  # 'high', 'medium', 'low'

@dataclass
class SkillGap:
    """Represents identified skill gaps"""
    concept: str
    gap_severity: float  # 0-1 scale
    related_concepts: List[str]
    evidence: List[str]
    improvement_path: List[str]
    estimated_practice_time: int  # in minutes
    recommended_problems: List[str]

class LearningAnalytics:
    """Advanced learning analytics engine"""
    
    def __init__(self):
        self.db = db_service.db
        self.error_patterns = {}
        self.learning_styles = {}
        self.concept_dependencies = self._load_concept_dependencies()
        
    def _load_concept_dependencies(self) -> Dict[str, List[str]]:
        """Load concept dependency graph"""
        return {
            'variables': [],
            'loops': ['variables'],
            'conditionals': ['variables'],
            'functions': ['variables', 'loops', 'conditionals'],
            'arrays': ['variables', 'loops'],
            'strings': ['variables', 'arrays'],
            'recursion': ['functions'],
            'data_structures': ['arrays', 'functions'],
            'algorithms': ['data_structures', 'recursion'],
            'object_oriented': ['functions', 'data_structures'],
            'dynamic_programming': ['recursion', 'algorithms'],
            'graph_algorithms': ['data_structures', 'algorithms'],
            'system_design': ['algorithms', 'data_structures']
        }
    
    def analyze_learning_patterns(self, user_id: str, days_back: int = 30) -> Dict[str, Any]:
        """
        Comprehensive analysis of user's learning patterns
        """
        # Get user's submission history
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        submissions = list(self.db.evaluations.find({
            'user_id': user_id,
            'submission_time': {
                '$gte': start_date.isoformat(),
                '$lte': end_date.isoformat()
            }
        }).sort('submission_time', 1))
        
        if not submissions:
            return self._empty_analysis()
        
        # Analyze patterns
        patterns = {
            'temporal_patterns': self._analyze_temporal_patterns(submissions),
            'solving_patterns': self._analyze_solving_patterns(submissions),
            'error_patterns': self._analyze_error_patterns(submissions),
            'progress_patterns': self._analyze_progress_patterns(submissions),
            'difficulty_patterns': self._analyze_difficulty_patterns(submissions),
            'concept_patterns': self._analyze_concept_patterns(submissions),
            'time_investment_patterns': self._analyze_time_patterns(submissions),
            'learning_velocity': self._calculate_learning_velocity(submissions),
            'consistency_metrics': self._analyze_consistency(submissions)
        }
        
        return patterns
    
    def _analyze_temporal_patterns(self, submissions: List[Dict]) -> Dict[str, Any]:
        """Analyze when user learns best"""
        patterns = {
            'peak_hours': [],
            'peak_days': [],
            'session_lengths': [],
            'break_patterns': [],
            'consistency_score': 0.0
        }
        
        # Extract timestamps
        timestamps = [datetime.fromisoformat(s['submission_time']) for s in submissions]
        
        # Peak hours analysis
        hours = [t.hour for t in timestamps]
        hour_counts = Counter(hours)
        patterns['peak_hours'] = sorted(hour_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # Peak days analysis
        days = [t.strftime('%A') for t in timestamps]
        day_counts = Counter(days)
        patterns['peak_days'] = sorted(day_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # Session length analysis
        sessions = self._group_into_sessions(timestamps)
        patterns['session_lengths'] = [s['duration'] for s in sessions]
        patterns['average_session_length'] = statistics.mean(patterns['session_lengths']) if patterns['session_lengths'] else 0
        
        # Consistency score (how regularly user practices)
        unique_days = len(set(t.date() for t in timestamps))
        total_days = (max(timestamps) - min(timestamps)).days + 1 if timestamps else 1
        patterns['consistency_score'] = unique_days / total_days
        
        return patterns
    
    def _analyze_solving_patterns(self, submissions: List[Dict]) -> Dict[str, Any]:
        """Analyze how user approaches problem solving"""
        patterns = {
            'first_attempt_success_rate': 0.0,
            'average_attempts_per_problem': 0.0,
            'giving_up_threshold': 0,
            'preferred_problem_types': [],
            'solution_elegance_trend': [],
            'debugging_efficiency': 0.0
        }
        
        # Group by problem
        problem_attempts = defaultdict(list)
        for submission in submissions:
            problem_id = submission.get('problem_id')
            problem_attempts[problem_id].append(submission)
        
        first_attempt_successes = 0
        total_problems = len(problem_attempts)
        attempt_counts = []
        
        for problem_id, attempts in problem_attempts.items():
            attempts.sort(key=lambda x: x['submission_time'])
            attempt_counts.append(len(attempts))
            
            # Check first attempt success
            if attempts[0].get('all_passed', False):
                first_attempt_successes += 1
        
        if total_problems > 0:
            patterns['first_attempt_success_rate'] = first_attempt_successes / total_problems
            patterns['average_attempts_per_problem'] = statistics.mean(attempt_counts)
            patterns['giving_up_threshold'] = max(attempt_counts) if attempt_counts else 0
        
        return patterns
    
    def _analyze_error_patterns(self, submissions: List[Dict]) -> Dict[str, Any]:
        """Analyze common error patterns and misconceptions"""
        patterns = {
            'syntax_errors': 0,
            'logic_errors': 0,
            'runtime_errors': 0,
            'timeout_errors': 0,
            'common_mistakes': [],
            'error_recovery_time': [],
            'misconception_indicators': []
        }
        
        error_types = defaultdict(int)
        
        for submission in submissions:
            results = submission.get('results', [])
            for result in results:
                if result.get('error'):
                    error_msg = result['error'].lower()
                    
                    # Categorize errors
                    if any(keyword in error_msg for keyword in ['syntax', 'invalid syntax', 'indentation']):
                        error_types['syntax'] += 1
                    elif any(keyword in error_msg for keyword in ['timeout', 'time limit']):
                        error_types['timeout'] += 1
                    elif any(keyword in error_msg for keyword in ['runtime', 'exception', 'error']):
                        error_types['runtime'] += 1
                    else:
                        error_types['logic'] += 1
        
        patterns['syntax_errors'] = error_types['syntax']
        patterns['logic_errors'] = error_types['logic']
        patterns['runtime_errors'] = error_types['runtime']
        patterns['timeout_errors'] = error_types['timeout']
        
        return patterns
    
    def _analyze_progress_patterns(self, submissions: List[Dict]) -> Dict[str, Any]:
        """Analyze learning progress and improvement trends"""
        patterns = {
            'improvement_rate': 0.0,
            'plateaus_detected': [],
            'breakthrough_moments': [],
            'skill_acquisition_curve': [],
            'regression_periods': []
        }
        
        # Calculate rolling success rate
        window_size = 10
        success_rates = []
        
        for i in range(len(submissions)):
            start_idx = max(0, i - window_size + 1)
            window_submissions = submissions[start_idx:i+1]
            success_count = sum(1 for s in window_submissions if s.get('all_passed', False))
            success_rate = success_count / len(window_submissions)
            success_rates.append(success_rate)
        
        patterns['skill_acquisition_curve'] = success_rates
        
        # Detect improvement rate
        if len(success_rates) >= 2:
            early_rate = statistics.mean(success_rates[:len(success_rates)//3]) if success_rates else 0
            recent_rate = statistics.mean(success_rates[-len(success_rates)//3:]) if success_rates else 0
            patterns['improvement_rate'] = recent_rate - early_rate
        
        return patterns
    
    def _analyze_difficulty_patterns(self, submissions: List[Dict]) -> Dict[str, Any]:
        """Analyze how user handles different difficulty levels"""
        patterns = {
            'comfort_zone': 'easy',
            'challenge_seeking': False,
            'difficulty_adaptation_rate': 0.0,
            'success_by_difficulty': {}
        }
        
        difficulty_performance = defaultdict(list)
        
        for submission in submissions:
            difficulty = submission.get('difficulty', 'unknown')
            success = submission.get('all_passed', False)
            difficulty_performance[difficulty].append(success)
        
        # Calculate success rates by difficulty
        for difficulty, results in difficulty_performance.items():
            success_rate = sum(results) / len(results) if results else 0
            patterns['success_by_difficulty'][difficulty] = success_rate
        
        # Determine comfort zone
        if patterns['success_by_difficulty']:
            comfort_zone = max(patterns['success_by_difficulty'].items(), key=lambda x: x[1])
            patterns['comfort_zone'] = comfort_zone[0]
        
        return patterns
    
    def _analyze_concept_patterns(self, submissions: List[Dict]) -> Dict[str, Any]:
        """Analyze performance across different programming concepts"""
        patterns = {
            'strong_concepts': [],
            'weak_concepts': [],
            'concept_progression': {},
            'cross_concept_transfer': {}
        }
        
        concept_performance = defaultdict(list)
        
        for submission in submissions:
            concepts = submission.get('concepts', [])
            success = submission.get('all_passed', False)
            
            for concept in concepts:
                concept_performance[concept].append(success)
        
        # Identify strong and weak concepts
        concept_scores = {}
        for concept, results in concept_performance.items():
            if len(results) >= 3:  # Only consider concepts with sufficient data
                score = sum(results) / len(results)
                concept_scores[concept] = score
        
        if concept_scores:
            sorted_concepts = sorted(concept_scores.items(), key=lambda x: x[1], reverse=True)
            patterns['strong_concepts'] = sorted_concepts[:3]
            patterns['weak_concepts'] = sorted_concepts[-3:]
        
        return patterns
    
    def _analyze_time_patterns(self, submissions: List[Dict]) -> Dict[str, Any]:
        """Analyze time investment patterns"""
        patterns = {
            'average_time_per_problem': 0.0,
            'time_efficiency_trend': [],
            'quick_vs_thorough': 'balanced',
            'time_pressure_performance': {}
        }
        
        problem_times = []
        for submission in submissions:
            time_spent = submission.get('time_spent_seconds', 0) / 60  # Convert to minutes
            if time_spent > 0:
                problem_times.append(time_spent)
        
        if problem_times:
            patterns['average_time_per_problem'] = statistics.mean(problem_times)
            patterns['median_time_per_problem'] = statistics.median(problem_times)
        
        return patterns
    
    def _calculate_learning_velocity(self, submissions: List[Dict]) -> Dict[str, float]:
        """Calculate how quickly user is learning"""
        if len(submissions) < 10:
            return {'velocity': 0.0, 'acceleration': 0.0}
        
        # Calculate success rate over time windows
        window_size = 5
        velocities = []
        
        for i in range(window_size, len(submissions), window_size):
            prev_window = submissions[i-window_size:i]
            curr_window = submissions[i:i+window_size]
            
            prev_success = sum(1 for s in prev_window if s.get('all_passed', False)) / len(prev_window)
            curr_success = sum(1 for s in curr_window if s.get('all_passed', False)) / len(curr_window)
            
            velocity = curr_success - prev_success
            velocities.append(velocity)
        
        avg_velocity = statistics.mean(velocities) if velocities else 0
        acceleration = (velocities[-1] - velocities[0]) / len(velocities) if len(velocities) > 1 else 0
        
        return {'velocity': avg_velocity, 'acceleration': acceleration}
    
    def _analyze_consistency(self, submissions: List[Dict]) -> Dict[str, float]:
        """Analyze learning consistency metrics"""
        if not submissions:
            return {'consistency_score': 0.0, 'reliability_index': 0.0}
        
        # Daily submission counts
        daily_submissions = defaultdict(int)
        for submission in submissions:
            date = datetime.fromisoformat(submission['submission_time']).date()
            daily_submissions[date] += 1
        
        submission_counts = list(daily_submissions.values())
        consistency_score = 1.0 - (statistics.stdev(submission_counts) / statistics.mean(submission_counts)) if len(submission_counts) > 1 else 1.0
        
        # Performance reliability
        success_rates = [s.get('all_passed', False) for s in submissions[-20:]]  # Last 20 submissions
        reliability_index = sum(success_rates) / len(success_rates) if success_rates else 0
        
        return {
            'consistency_score': max(0, min(1, consistency_score)),
            'reliability_index': reliability_index
        }
    
    def _group_into_sessions(self, timestamps: List[datetime]) -> List[Dict]:
        """Group submissions into learning sessions"""
        if not timestamps:
            return []
        
        sessions = []
        current_session = {'start': timestamps[0], 'submissions': [timestamps[0]]}
        
        for i in range(1, len(timestamps)):
            time_gap = (timestamps[i] - timestamps[i-1]).total_seconds() / 60  # minutes
            
            if time_gap > 30:  # New session if gap > 30 minutes
                current_session['end'] = timestamps[i-1]
                current_session['duration'] = (current_session['end'] - current_session['start']).total_seconds() / 60
                sessions.append(current_session)
                current_session = {'start': timestamps[i], 'submissions': [timestamps[i]]}
            else:
                current_session['submissions'].append(timestamps[i])
        
        # Add final session
        current_session['end'] = timestamps[-1]
        current_session['duration'] = (current_session['end'] - current_session['start']).total_seconds() / 60
        sessions.append(current_session)
        
        return sessions
    
    def _empty_analysis(self) -> Dict[str, Any]:
        """Return empty analysis structure"""
        return {
            'temporal_patterns': {},
            'solving_patterns': {},
            'error_patterns': {},
            'progress_patterns': {},
            'difficulty_patterns': {},
            'concept_patterns': {},
            'time_investment_patterns': {},
            'learning_velocity': {'velocity': 0.0, 'acceleration': 0.0},
            'consistency_metrics': {'consistency_score': 0.0, 'reliability_index': 0.0}
        }
    
    def generate_learning_insights(self, user_id: str) -> List[LearningInsight]:
        """Generate actionable learning insights"""
        patterns = self.analyze_learning_patterns(user_id)
        insights = []
        
        # Temporal insights
        if patterns['temporal_patterns'].get('peak_hours'):
            peak_hour = patterns['temporal_patterns']['peak_hours'][0][0]
            insights.append(LearningInsight(
                insight_type='optimization',
                title='Optimal Learning Time Identified',
                description=f'You perform best around {peak_hour}:00. Consider scheduling focused practice during this time.',
                evidence=[f'Highest activity at {peak_hour}:00 with {patterns["temporal_patterns"]["peak_hours"][0][1]} submissions'],
                confidence_score=0.8,
                action_items=[f'Schedule daily practice sessions around {peak_hour}:00'],
                priority='medium'
            ))
        
        # Consistency insights
        consistency = patterns['consistency_metrics']['consistency_score']
        if consistency < 0.5:
            insights.append(LearningInsight(
                insight_type='habit',
                title='Inconsistent Practice Pattern Detected',
                description='Your practice schedule is irregular. Consistent daily practice leads to better retention.',
                evidence=[f'Consistency score: {consistency:.2f}'],
                confidence_score=0.9,
                action_items=['Set a daily practice schedule', 'Start with 15-30 minutes daily'],
                priority='high'
            ))
        
        # Learning velocity insights
        velocity = patterns['learning_velocity']['velocity']
        if velocity > 0.1:
            insights.append(LearningInsight(
                insight_type='strength',
                title='Strong Learning Progression',
                description='You\'re showing excellent improvement over time. Keep up the momentum!',
                evidence=[f'Learning velocity: +{velocity:.2f}'],
                confidence_score=0.8,
                action_items=['Continue current learning approach', 'Consider tackling more challenging problems'],
                priority='low'
            ))
        elif velocity < -0.1:
            insights.append(LearningInsight(
                insight_type='warning',
                title='Learning Plateau Detected',
                description='Your progress has slowed. Consider changing your approach or taking a break.',
                evidence=[f'Learning velocity: {velocity:.2f}'],
                confidence_score=0.7,
                action_items=['Review fundamental concepts', 'Try different problem types', 'Take a short break'],
                priority='high'
            ))
        
        # Error pattern insights
        error_patterns = patterns['error_patterns']
        if error_patterns.get('syntax_errors', 0) > error_patterns.get('logic_errors', 0):
            insights.append(LearningInsight(
                insight_type='weakness',
                title='Syntax Errors Predominant',
                description='You\'re making more syntax errors than logic errors. Focus on language fundamentals.',
                evidence=[f'Syntax errors: {error_patterns["syntax_errors"]}, Logic errors: {error_patterns["logic_errors"]}'],
                confidence_score=0.8,
                action_items=['Practice basic syntax', 'Use IDE with syntax highlighting', 'Review language documentation'],
                priority='medium'
            ))
        
        return insights

    def get_personalized_recommendations(self, user_id: str) -> Dict[str, List[str]]:
        """Generate personalized learning recommendations"""
        patterns = self.analyze_learning_patterns(user_id)
        insights = self.generate_learning_insights(user_id)
        
        recommendations = {
            'immediate_actions': [],
            'study_plan': [],
            'problem_suggestions': [],
            'skill_development': [],
            'habit_improvements': []
        }
        
        # Convert insights to recommendations
        for insight in insights:
            if insight.priority == 'high':
                recommendations['immediate_actions'].extend(insight.action_items)
            elif insight.insight_type == 'habit':
                recommendations['habit_improvements'].extend(insight.action_items)
            else:
                recommendations['study_plan'].extend(insight.action_items)
        
        # Add skill-specific recommendations
        weak_concepts = patterns.get('concept_patterns', {}).get('weak_concepts', [])
        for concept, score in weak_concepts:
            recommendations['skill_development'].append(f'Practice {concept} concepts (current score: {score:.2f})')
        
        return recommendations