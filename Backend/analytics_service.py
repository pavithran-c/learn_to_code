"""
Analytics Service - Phase 4: Advanced Analytics Dashboard
Detailed performance metrics calculation and trend analysis
"""

import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, asdict
import json
import statistics
from collections import defaultdict, Counter
import math

from database_service import db_service

@dataclass
class PerformanceMetrics:
    """Comprehensive performance metrics"""
    user_id: str
    timestamp: datetime
    
    # Core Performance
    accuracy_score: float
    speed_score: float
    consistency_score: float
    difficulty_handling: float
    overall_performance: float
    
    # Detailed Metrics
    correct_answers: int
    total_attempts: int
    average_time_per_problem: float
    fastest_solve_time: float
    slowest_solve_time: float
    
    # Advanced Analytics
    learning_efficiency: float
    retention_rate: float
    mastery_progression: float
    error_reduction_rate: float
    
    # Concept-specific Metrics
    concept_mastery_levels: Dict[str, float]
    concept_improvement_rates: Dict[str, float]
    strongest_concepts: List[str]
    weakest_concepts: List[str]
    
    # Time-based Analysis
    peak_performance_hours: List[int]
    performance_by_session_length: Dict[str, float]
    weekly_performance_trend: str
    monthly_performance_trend: str

@dataclass
class TrendAnalysis:
    """Trend analysis data"""
    metric_name: str
    time_period: str
    data_points: List[Tuple[datetime, float]]
    trend_direction: str  # "increasing", "decreasing", "stable", "volatile"
    trend_strength: float  # 0.0 to 1.0
    slope: float
    r_squared: float
    projection_7_days: float
    projection_30_days: float

@dataclass
class PerformanceComparison:
    """Performance comparison metrics"""
    user_id: str
    comparison_type: str  # "peer", "historical", "target"
    
    # Comparison Data
    user_score: float
    comparison_score: float
    percentile_rank: float
    improvement_needed: float
    
    # Relative Performance
    better_than_percentage: float
    areas_of_excellence: List[str]
    areas_for_improvement: List[str]

class AnalyticsService:
    """Advanced analytics service for performance calculation"""
    
    def __init__(self):
        self.db = db_service.db
        
        # Performance calculation weights
        self.metric_weights = {
            'accuracy': 0.4,
            'speed': 0.2,
            'consistency': 0.2,
            'difficulty_handling': 0.2
        }
        
        # Time-based analysis windows
        self.analysis_windows = {
            'short_term': timedelta(days=7),
            'medium_term': timedelta(days=30),
            'long_term': timedelta(days=90)
        }
    
    def calculate_comprehensive_metrics(self, user_id: str, time_window: Optional[timedelta] = None) -> PerformanceMetrics:
        """Calculate comprehensive performance metrics"""
        if time_window is None:
            time_window = self.analysis_windows['medium_term']
        
        try:
            # Get user submissions within time window
            start_date = datetime.utcnow() - time_window
            submissions = list(self.db.submissions.find({
                'user_id': user_id,
                'timestamp': {'$gte': start_date}
            }, sort=[('timestamp', 1)]))
            
            if not submissions:
                return self._get_empty_metrics(user_id)
            
            # Calculate core metrics
            accuracy_score = self._calculate_accuracy_score(submissions)
            speed_score = self._calculate_speed_score(submissions)
            consistency_score = self._calculate_consistency_score(submissions)
            difficulty_handling = self._calculate_difficulty_handling(submissions)
            
            # Calculate overall performance
            overall_performance = (
                accuracy_score * self.metric_weights['accuracy'] +
                speed_score * self.metric_weights['speed'] +
                consistency_score * self.metric_weights['consistency'] +
                difficulty_handling * self.metric_weights['difficulty_handling']
            )
            
            # Calculate detailed metrics
            correct_answers = sum(1 for s in submissions if s.get('is_correct', False))
            total_attempts = len(submissions)
            times = [s.get('time_taken', 0) for s in submissions if s.get('time_taken', 0) > 0]
            
            average_time = statistics.mean(times) if times else 0
            fastest_time = min(times) if times else 0
            slowest_time = max(times) if times else 0
            
            # Calculate advanced analytics
            learning_efficiency = self._calculate_learning_efficiency(submissions)
            retention_rate = self._calculate_retention_rate(user_id, submissions)
            mastery_progression = self._calculate_mastery_progression(submissions)
            error_reduction_rate = self._calculate_error_reduction_rate(submissions)
            
            # Calculate concept-specific metrics
            concept_metrics = self._calculate_concept_metrics(submissions)
            
            # Calculate time-based analysis
            time_analysis = self._calculate_time_based_analysis(user_id, submissions)
            
            return PerformanceMetrics(
                user_id=user_id,
                timestamp=datetime.utcnow(),
                
                # Core Performance
                accuracy_score=accuracy_score,
                speed_score=speed_score,
                consistency_score=consistency_score,
                difficulty_handling=difficulty_handling,
                overall_performance=overall_performance,
                
                # Detailed Metrics
                correct_answers=correct_answers,
                total_attempts=total_attempts,
                average_time_per_problem=average_time,
                fastest_solve_time=fastest_time,
                slowest_solve_time=slowest_time,
                
                # Advanced Analytics
                learning_efficiency=learning_efficiency,
                retention_rate=retention_rate,
                mastery_progression=mastery_progression,
                error_reduction_rate=error_reduction_rate,
                
                # Concept-specific Metrics
                concept_mastery_levels=concept_metrics['mastery_levels'],
                concept_improvement_rates=concept_metrics['improvement_rates'],
                strongest_concepts=concept_metrics['strongest'],
                weakest_concepts=concept_metrics['weakest'],
                
                # Time-based Analysis
                peak_performance_hours=time_analysis['peak_hours'],
                performance_by_session_length=time_analysis['session_performance'],
                weekly_performance_trend=time_analysis['weekly_trend'],
                monthly_performance_trend=time_analysis['monthly_trend']
            )
            
        except Exception as e:
            print(f"Error calculating metrics for {user_id}: {e}")
            return self._get_empty_metrics(user_id)
    
    def analyze_performance_trends(self, user_id: str, metric_name: str, time_period: str = "30_days") -> TrendAnalysis:
        """Analyze performance trends for specific metrics"""
        try:
            # Define time period
            if time_period == "7_days":
                days = 7
                interval = timedelta(hours=12)  # Twice daily data points
            elif time_period == "30_days":
                days = 30
                interval = timedelta(days=1)    # Daily data points
            elif time_period == "90_days":
                days = 90
                interval = timedelta(days=3)    # Every 3 days
            else:
                days = 30
                interval = timedelta(days=1)
            
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # Collect data points
            data_points = []
            current_date = start_date
            
            while current_date <= datetime.utcnow():
                next_date = current_date + interval
                
                # Get submissions in this interval
                interval_submissions = list(self.db.submissions.find({
                    'user_id': user_id,
                    'timestamp': {'$gte': current_date, '$lt': next_date}
                }))
                
                if interval_submissions:
                    metric_value = self._calculate_metric_value(interval_submissions, metric_name)
                    data_points.append((current_date, metric_value))
                
                current_date = next_date
            
            if len(data_points) < 3:
                return self._get_empty_trend_analysis(metric_name, time_period)
            
            # Analyze trend
            trend_analysis = self._analyze_trend_data(data_points)
            
            return TrendAnalysis(
                metric_name=metric_name,
                time_period=time_period,
                data_points=data_points,
                trend_direction=trend_analysis['direction'],
                trend_strength=trend_analysis['strength'],
                slope=trend_analysis['slope'],
                r_squared=trend_analysis['r_squared'],
                projection_7_days=trend_analysis['projection_7'],
                projection_30_days=trend_analysis['projection_30']
            )
            
        except Exception as e:
            print(f"Error analyzing trends for {user_id}: {e}")
            return self._get_empty_trend_analysis(metric_name, time_period)
    
    def compare_performance(self, user_id: str, comparison_type: str = "peer") -> PerformanceComparison:
        """Compare user performance against peers, historical data, or targets"""
        try:
            user_metrics = self.calculate_comprehensive_metrics(user_id)
            user_score = user_metrics.overall_performance
            
            if comparison_type == "peer":
                comparison_data = self._get_peer_comparison_data(user_id)
                comparison_score = comparison_data['average_score']
                percentile_rank = comparison_data['percentile_rank']
                better_than_percentage = comparison_data['better_than_percentage']
                
            elif comparison_type == "historical":
                comparison_data = self._get_historical_comparison_data(user_id)
                comparison_score = comparison_data['historical_average']
                percentile_rank = 0.5  # Historical comparison doesn't have percentiles
                better_than_percentage = self._calculate_historical_improvement(user_id)
                
            elif comparison_type == "target":
                comparison_data = self._get_target_comparison_data(user_id)
                comparison_score = comparison_data['target_score']
                percentile_rank = 0.0  # Not applicable for targets
                better_than_percentage = min(100.0, (user_score / comparison_score) * 100)
                
            else:
                raise ValueError(f"Unknown comparison type: {comparison_type}")
            
            # Calculate improvement needed
            improvement_needed = max(0, comparison_score - user_score)
            
            # Identify areas of excellence and improvement
            excellence_areas = self._identify_excellence_areas(user_metrics)
            improvement_areas = self._identify_improvement_areas(user_metrics)
            
            return PerformanceComparison(
                user_id=user_id,
                comparison_type=comparison_type,
                user_score=user_score,
                comparison_score=comparison_score,
                percentile_rank=percentile_rank,
                improvement_needed=improvement_needed,
                better_than_percentage=better_than_percentage,
                areas_of_excellence=excellence_areas,
                areas_for_improvement=improvement_areas
            )
            
        except Exception as e:
            print(f"Error comparing performance for {user_id}: {e}")
            return self._get_empty_comparison(user_id, comparison_type)
    
    def get_detailed_concept_analysis(self, user_id: str, concept: str) -> Dict[str, Any]:
        """Get detailed analysis for a specific concept"""
        try:
            concept_submissions = list(self.db.submissions.find({
                'user_id': user_id,
                'concept': concept
            }, sort=[('timestamp', 1)]))
            
            if not concept_submissions:
                return {}
            
            analysis = {
                'concept': concept,
                'total_attempts': len(concept_submissions),
                'correct_attempts': sum(1 for s in concept_submissions if s.get('is_correct', False)),
                'accuracy_rate': sum(1 for s in concept_submissions if s.get('is_correct', False)) / len(concept_submissions),
                
                'time_analysis': {
                    'average_time': statistics.mean([s.get('time_taken', 0) for s in concept_submissions]),
                    'best_time': min([s.get('time_taken', float('inf')) for s in concept_submissions]),
                    'improvement_trend': self._calculate_time_improvement_trend(concept_submissions)
                },
                
                'difficulty_progression': self._analyze_difficulty_progression(concept_submissions),
                'learning_curve': self._calculate_learning_curve(concept_submissions),
                'error_patterns': self._analyze_error_patterns(concept_submissions),
                
                'mastery_indicators': {
                    'consistency_score': self._calculate_concept_consistency(concept_submissions),
                    'retention_score': self._calculate_concept_retention(user_id, concept),
                    'transfer_ability': self._calculate_transfer_ability(user_id, concept)
                },
                
                'recommendations': self._generate_concept_recommendations(concept_submissions)
            }
            
            return analysis
            
        except Exception as e:
            print(f"Error analyzing concept {concept} for {user_id}: {e}")
            return {}
    
    def calculate_learning_velocity(self, user_id: str) -> Dict[str, Any]:
        """Calculate learning velocity metrics"""
        try:
            submissions = list(self.db.submissions.find(
                {'user_id': user_id},
                sort=[('timestamp', 1)]
            ))
            
            if len(submissions) < 10:
                return {}
            
            # Group submissions by time periods
            daily_progress = self._group_submissions_by_day(submissions)
            weekly_progress = self._group_submissions_by_week(submissions)
            
            velocity_metrics = {
                'concepts_per_week': self._calculate_concepts_per_week(weekly_progress),
                'problems_per_day': self._calculate_problems_per_day(daily_progress),
                'mastery_rate': self._calculate_mastery_rate(submissions),
                'learning_acceleration': self._calculate_learning_acceleration(submissions),
                
                'velocity_trends': {
                    'short_term_velocity': self._calculate_recent_velocity(submissions, days=7),
                    'medium_term_velocity': self._calculate_recent_velocity(submissions, days=30),
                    'long_term_velocity': self._calculate_recent_velocity(submissions, days=90)
                },
                
                'efficiency_metrics': {
                    'time_to_mastery': self._calculate_time_to_mastery(user_id),
                    'problem_efficiency': self._calculate_problem_efficiency(submissions),
                    'concept_transfer_rate': self._calculate_concept_transfer_rate(submissions)
                },
                
                'velocity_predictions': {
                    'projected_weekly_progress': self._predict_weekly_progress(submissions),
                    'estimated_completion_time': self._estimate_completion_time(user_id),
                    'optimal_study_schedule': self._suggest_optimal_schedule(user_id)
                }
            }
            
            return velocity_metrics
            
        except Exception as e:
            print(f"Error calculating learning velocity for {user_id}: {e}")
            return {}
    
    def generate_performance_insights(self, user_id: str) -> List[Dict[str, Any]]:
        """Generate actionable performance insights"""
        try:
            metrics = self.calculate_comprehensive_metrics(user_id)
            trends = self.analyze_performance_trends(user_id, "overall_performance")
            comparisons = self.compare_performance(user_id, "peer")
            
            insights = []
            
            # Performance trend insights
            if trends.trend_direction == "increasing":
                insights.append({
                    'type': 'positive_trend',
                    'title': 'Performance Improving',
                    'description': f'Your performance has been improving with a {trends.trend_strength:.1%} strength trend.',
                    'priority': 'medium',
                    'actionable': False
                })
            elif trends.trend_direction == "decreasing":
                insights.append({
                    'type': 'negative_trend',
                    'title': 'Performance Declining',
                    'description': f'Your performance shows a declining trend. Consider reviewing fundamental concepts.',
                    'priority': 'high',
                    'actionable': True,
                    'suggested_actions': ['Review basic concepts', 'Take a break', 'Adjust study schedule']
                })
            
            # Accuracy insights
            if metrics.accuracy_score < 0.6:
                insights.append({
                    'type': 'accuracy_concern',
                    'title': 'Low Accuracy Rate',
                    'description': f'Your accuracy rate of {metrics.accuracy_score:.1%} is below optimal. Focus on understanding rather than speed.',
                    'priority': 'high',
                    'actionable': True,
                    'suggested_actions': ['Slow down and think through problems', 'Review incorrect answers', 'Practice similar problems']
                })
            
            # Speed insights
            if metrics.speed_score < 0.4:
                insights.append({
                    'type': 'speed_concern',
                    'title': 'Solving Speed Below Average',
                    'description': 'Consider practicing time management and pattern recognition.',
                    'priority': 'medium',
                    'actionable': True,
                    'suggested_actions': ['Practice timed sessions', 'Learn common patterns', 'Use shortcuts']
                })
            
            # Consistency insights
            if metrics.consistency_score < 0.5:
                insights.append({
                    'type': 'consistency_issue',
                    'title': 'Inconsistent Performance',
                    'description': 'Your performance varies significantly. Establish a regular study routine.',
                    'priority': 'medium',
                    'actionable': True,
                    'suggested_actions': ['Create study schedule', 'Set daily goals', 'Track progress']
                })
            
            # Peer comparison insights
            if comparisons.percentile_rank < 0.3:
                insights.append({
                    'type': 'peer_comparison',
                    'title': 'Below Peer Average',
                    'description': f'You\'re performing below {comparisons.better_than_percentage:.0f}% of peers. Focus on improvement areas.',
                    'priority': 'medium',
                    'actionable': True,
                    'suggested_actions': comparisons.areas_for_improvement[:3]
                })
            
            # Concept-specific insights
            if metrics.weakest_concepts:
                insights.append({
                    'type': 'weak_concepts',
                    'title': 'Concepts Needing Attention',
                    'description': f'Focus on improving: {", ".join(metrics.weakest_concepts[:3])}',
                    'priority': 'high',
                    'actionable': True,
                    'suggested_actions': [f'Practice {concept} problems' for concept in metrics.weakest_concepts[:3]]
                })
            
            return insights
            
        except Exception as e:
            print(f"Error generating insights for {user_id}: {e}")
            return []
    
    # Private helper methods
    def _calculate_accuracy_score(self, submissions: List[Dict]) -> float:
        """Calculate accuracy score"""
        if not submissions:
            return 0.0
        
        correct_count = sum(1 for s in submissions if s.get('is_correct', False))
        return correct_count / len(submissions)
    
    def _calculate_speed_score(self, submissions: List[Dict]) -> float:
        """Calculate speed score (normalized)"""
        if not submissions:
            return 0.0
        
        times = [s.get('time_taken', 0) for s in submissions if s.get('time_taken', 0) > 0]
        if not times:
            return 0.0
        
        # Normalize speed score (faster is better, but with diminishing returns)
        avg_time = statistics.mean(times)
        optimal_time = 120  # 2 minutes as optimal time
        
        if avg_time <= optimal_time:
            return 1.0
        else:
            # Exponential decay for longer times
            return math.exp(-(avg_time - optimal_time) / optimal_time)
    
    def _calculate_consistency_score(self, submissions: List[Dict]) -> float:
        """Calculate consistency score"""
        if len(submissions) < 5:
            return 0.0
        
        # Calculate variance in performance
        correct_rates = []
        window_size = 5
        
        for i in range(len(submissions) - window_size + 1):
            window = submissions[i:i + window_size]
            correct_rate = sum(1 for s in window if s.get('is_correct', False)) / window_size
            correct_rates.append(correct_rate)
        
        if not correct_rates:
            return 0.0
        
        variance = statistics.variance(correct_rates) if len(correct_rates) > 1 else 0
        # Convert variance to consistency score (lower variance = higher consistency)
        consistency = max(0, 1 - (variance * 4))  # Scale variance appropriately
        
        return consistency
    
    def _calculate_difficulty_handling(self, submissions: List[Dict]) -> float:
        """Calculate how well user handles different difficulty levels"""
        if not submissions:
            return 0.0
        
        difficulty_performance = defaultdict(list)
        
        for submission in submissions:
            difficulty = submission.get('difficulty', 'medium')
            is_correct = submission.get('is_correct', False)
            difficulty_performance[difficulty].append(is_correct)
        
        if not difficulty_performance:
            return 0.0
        
        # Calculate weighted performance across difficulties
        difficulty_weights = {'easy': 0.1, 'medium': 0.6, 'hard': 0.3}
        total_score = 0
        total_weight = 0
        
        for difficulty, results in difficulty_performance.items():
            if difficulty in difficulty_weights:
                accuracy = sum(results) / len(results)
                weight = difficulty_weights[difficulty]
                total_score += accuracy * weight
                total_weight += weight
        
        return total_score / total_weight if total_weight > 0 else 0.0
    
    def _calculate_learning_efficiency(self, submissions: List[Dict]) -> float:
        """Calculate learning efficiency"""
        if len(submissions) < 10:
            return 0.0
        
        # Analyze improvement over time
        first_half = submissions[:len(submissions)//2]
        second_half = submissions[len(submissions)//2:]
        
        first_accuracy = sum(1 for s in first_half if s.get('is_correct', False)) / len(first_half)
        second_accuracy = sum(1 for s in second_half if s.get('is_correct', False)) / len(second_half)
        
        improvement = second_accuracy - first_accuracy
        # Normalize to 0-1 scale
        efficiency = max(0, min(1, 0.5 + improvement))
        
        return efficiency
    
    def _calculate_retention_rate(self, user_id: str, recent_submissions: List[Dict]) -> float:
        """Calculate knowledge retention rate"""
        # Simplified retention calculation
        # In a real system, this would analyze revisiting of concepts
        return 0.8  # Placeholder
    
    def _calculate_mastery_progression(self, submissions: List[Dict]) -> float:
        """Calculate mastery progression rate"""
        if len(submissions) < 5:
            return 0.0
        
        # Calculate moving average of accuracy
        window_size = 5
        accuracies = []
        
        for i in range(len(submissions) - window_size + 1):
            window = submissions[i:i + window_size]
            accuracy = sum(1 for s in window if s.get('is_correct', False)) / window_size
            accuracies.append(accuracy)
        
        if len(accuracies) < 2:
            return 0.0
        
        # Calculate progression (improvement in moving average)
        progression = accuracies[-1] - accuracies[0]
        return max(0, min(1, 0.5 + progression))
    
    def _calculate_error_reduction_rate(self, submissions: List[Dict]) -> float:
        """Calculate rate of error reduction over time"""
        if len(submissions) < 10:
            return 0.0
        
        # Split submissions into chunks and analyze error rates
        chunk_size = len(submissions) // 4
        error_rates = []
        
        for i in range(0, len(submissions), chunk_size):
            chunk = submissions[i:i + chunk_size]
            error_rate = 1 - (sum(1 for s in chunk if s.get('is_correct', False)) / len(chunk))
            error_rates.append(error_rate)
        
        if len(error_rates) < 2:
            return 0.0
        
        # Calculate reduction in error rate
        reduction = error_rates[0] - error_rates[-1]
        return max(0, min(1, reduction + 0.5))
    
    def _calculate_concept_metrics(self, submissions: List[Dict]) -> Dict[str, Any]:
        """Calculate concept-specific metrics"""
        concept_performance = defaultdict(list)
        
        for submission in submissions:
            concept = submission.get('concept', 'unknown')
            is_correct = submission.get('is_correct', False)
            concept_performance[concept].append(is_correct)
        
        mastery_levels = {}
        improvement_rates = {}
        
        for concept, results in concept_performance.items():
            if len(results) >= 3:
                mastery_levels[concept] = sum(results) / len(results)
                
                # Calculate improvement rate (simplified)
                first_half = results[:len(results)//2]
                second_half = results[len(results)//2:]
                
                if first_half and second_half:
                    first_acc = sum(first_half) / len(first_half)
                    second_acc = sum(second_half) / len(second_half)
                    improvement_rates[concept] = second_acc - first_acc
        
        # Identify strongest and weakest concepts
        sorted_concepts = sorted(mastery_levels.items(), key=lambda x: x[1], reverse=True)
        strongest = [concept for concept, _ in sorted_concepts[:3]]
        weakest = [concept for concept, _ in sorted_concepts[-3:]]
        
        return {
            'mastery_levels': mastery_levels,
            'improvement_rates': improvement_rates,
            'strongest': strongest,
            'weakest': weakest
        }
    
    def _calculate_time_based_analysis(self, user_id: str, submissions: List[Dict]) -> Dict[str, Any]:
        """Calculate time-based performance analysis"""
        # Performance by hour of day
        hourly_performance = defaultdict(list)
        
        for submission in submissions:
            timestamp = submission.get('timestamp')
            if timestamp:
                hour = timestamp.hour
                is_correct = submission.get('is_correct', False)
                hourly_performance[hour].append(is_correct)
        
        # Find peak performance hours
        hour_accuracies = {}
        for hour, results in hourly_performance.items():
            if len(results) >= 3:  # Need sufficient data
                hour_accuracies[hour] = sum(results) / len(results)
        
        peak_hours = sorted(hour_accuracies.items(), key=lambda x: x[1], reverse=True)
        peak_hours = [hour for hour, _ in peak_hours[:3]]
        
        # Performance by session length (simplified)
        session_performance = {
            'short': 0.7,    # < 30 minutes
            'medium': 0.8,   # 30-60 minutes
            'long': 0.6      # > 60 minutes
        }
        
        # Trend analysis
        weekly_trend = self._calculate_simple_trend(submissions, days=7)
        monthly_trend = self._calculate_simple_trend(submissions, days=30)
        
        return {
            'peak_hours': peak_hours,
            'session_performance': session_performance,
            'weekly_trend': weekly_trend,
            'monthly_trend': monthly_trend
        }
    
    def _calculate_simple_trend(self, submissions: List[Dict], days: int) -> str:
        """Calculate simple trend for given time period"""
        if len(submissions) < 10:
            return 'stable'
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        recent_submissions = [s for s in submissions if s.get('timestamp', datetime.min) >= cutoff_date]
        
        if len(recent_submissions) < 5:
            return 'stable'
        
        # Compare first and second half
        mid_point = len(recent_submissions) // 2
        first_half = recent_submissions[:mid_point]
        second_half = recent_submissions[mid_point:]
        
        first_accuracy = sum(1 for s in first_half if s.get('is_correct', False)) / len(first_half)
        second_accuracy = sum(1 for s in second_half if s.get('is_correct', False)) / len(second_half)
        
        difference = second_accuracy - first_accuracy
        
        if difference > 0.1:
            return 'improving'
        elif difference < -0.1:
            return 'declining'
        else:
            return 'stable'
    
    def _get_empty_metrics(self, user_id: str) -> PerformanceMetrics:
        """Return empty metrics for users with no data"""
        return PerformanceMetrics(
            user_id=user_id,
            timestamp=datetime.utcnow(),
            accuracy_score=0.0,
            speed_score=0.0,
            consistency_score=0.0,
            difficulty_handling=0.0,
            overall_performance=0.0,
            correct_answers=0,
            total_attempts=0,
            average_time_per_problem=0.0,
            fastest_solve_time=0.0,
            slowest_solve_time=0.0,
            learning_efficiency=0.0,
            retention_rate=0.0,
            mastery_progression=0.0,
            error_reduction_rate=0.0,
            concept_mastery_levels={},
            concept_improvement_rates={},
            strongest_concepts=[],
            weakest_concepts=[],
            peak_performance_hours=[],
            performance_by_session_length={},
            weekly_performance_trend='stable',
            monthly_performance_trend='stable'
        )
    
    def _calculate_metric_value(self, submissions: List[Dict], metric_name: str) -> float:
        """Calculate specific metric value for a set of submissions"""
        if not submissions:
            return 0.0
        
        if metric_name == "accuracy":
            return sum(1 for s in submissions if s.get('is_correct', False)) / len(submissions)
        elif metric_name == "speed":
            times = [s.get('time_taken', 0) for s in submissions if s.get('time_taken', 0) > 0]
            if not times:
                return 0.0
            avg_time = statistics.mean(times)
            return max(0, min(1, 300 / avg_time))  # Normalize to 0-1
        elif metric_name == "overall_performance":
            accuracy = sum(1 for s in submissions if s.get('is_correct', False)) / len(submissions)
            return accuracy  # Simplified overall performance
        else:
            return 0.0
    
    def _analyze_trend_data(self, data_points: List[Tuple[datetime, float]]) -> Dict[str, Any]:
        """Analyze trend from data points"""
        if len(data_points) < 3:
            return {
                'direction': 'stable',
                'strength': 0.0,
                'slope': 0.0,
                'r_squared': 0.0,
                'projection_7': 0.0,
                'projection_30': 0.0
            }
        
        # Extract values and time indices
        values = [point[1] for point in data_points]
        time_indices = list(range(len(values)))
        
        # Calculate linear regression
        n = len(values)
        sum_x = sum(time_indices)
        sum_y = sum(values)
        sum_xy = sum(x * y for x, y in zip(time_indices, values))
        sum_x2 = sum(x * x for x in time_indices)
        
        # Calculate slope and intercept
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x) if (n * sum_x2 - sum_x * sum_x) != 0 else 0
        intercept = (sum_y - slope * sum_x) / n
        
        # Calculate R-squared
        y_mean = sum_y / n
        ss_tot = sum((y - y_mean) ** 2 for y in values)
        ss_res = sum((y - (slope * x + intercept)) ** 2 for x, y in zip(time_indices, values))
        r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
        
        # Determine trend direction and strength
        if abs(slope) < 0.01:
            direction = 'stable'
            strength = 0.0
        elif slope > 0:
            direction = 'increasing'
            strength = min(1.0, abs(slope) * 10)  # Scale appropriately
        else:
            direction = 'decreasing'
            strength = min(1.0, abs(slope) * 10)
        
        # Make projections
        current_index = len(data_points) - 1
        projection_7 = slope * (current_index + 7) + intercept
        projection_30 = slope * (current_index + 30) + intercept
        
        return {
            'direction': direction,
            'strength': strength,
            'slope': slope,
            'r_squared': r_squared,
            'projection_7': max(0, min(1, projection_7)),
            'projection_30': max(0, min(1, projection_30))
        }
    
    def _get_empty_trend_analysis(self, metric_name: str, time_period: str) -> TrendAnalysis:
        """Return empty trend analysis"""
        return TrendAnalysis(
            metric_name=metric_name,
            time_period=time_period,
            data_points=[],
            trend_direction='stable',
            trend_strength=0.0,
            slope=0.0,
            r_squared=0.0,
            projection_7_days=0.0,
            projection_30_days=0.0
        )
    
    # Placeholder methods for complex calculations
    def _get_peer_comparison_data(self, user_id: str) -> Dict[str, Any]:
        """Get peer comparison data"""
        return {
            'average_score': 0.7,
            'percentile_rank': 0.5,
            'better_than_percentage': 50.0
        }
    
    def _get_historical_comparison_data(self, user_id: str) -> Dict[str, Any]:
        """Get historical comparison data"""
        return {'historical_average': 0.6}
    
    def _get_target_comparison_data(self, user_id: str) -> Dict[str, Any]:
        """Get target comparison data"""
        return {'target_score': 0.8}
    
    def _calculate_historical_improvement(self, user_id: str) -> float:
        """Calculate historical improvement percentage"""
        return 75.0  # Placeholder
    
    def _identify_excellence_areas(self, metrics: PerformanceMetrics) -> List[str]:
        """Identify areas of excellence"""
        areas = []
        if metrics.accuracy_score > 0.8:
            areas.append('High Accuracy')
        if metrics.speed_score > 0.8:
            areas.append('Fast Problem Solving')
        if metrics.consistency_score > 0.8:
            areas.append('Consistent Performance')
        return areas
    
    def _identify_improvement_areas(self, metrics: PerformanceMetrics) -> List[str]:
        """Identify areas for improvement"""
        areas = []
        if metrics.accuracy_score < 0.6:
            areas.append('Improve Accuracy')
        if metrics.speed_score < 0.6:
            areas.append('Increase Speed')
        if metrics.consistency_score < 0.6:
            areas.append('Maintain Consistency')
        return areas
    
    def _get_empty_comparison(self, user_id: str, comparison_type: str) -> PerformanceComparison:
        """Return empty comparison"""
        return PerformanceComparison(
            user_id=user_id,
            comparison_type=comparison_type,
            user_score=0.0,
            comparison_score=0.0,
            percentile_rank=0.0,
            improvement_needed=0.0,
            better_than_percentage=0.0,
            areas_of_excellence=[],
            areas_for_improvement=[]
        )

# Create global analytics service instance
analytics_service = AnalyticsService()