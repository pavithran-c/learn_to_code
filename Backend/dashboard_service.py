"""
Dashboard Service - Phase 4: Advanced Analytics Dashboard
Real-time data aggregation and dashboard metrics for frontend consumption
Enhanced with real-time WebSocket capabilities
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
import json
from collections import defaultdict, Counter
import asyncio
from concurrent.futures import ThreadPoolExecutor
import threading
import time
import random

from database_service import db_service
from learning_analytics import LearningAnalytics
from adaptive_engine_enhanced import EnhancedAdaptiveEngine
from skill_analyzer import SkillAnalyzer

@dataclass
class DashboardMetrics:
    """Comprehensive dashboard metrics"""
    user_id: str
    timestamp: datetime
    
    # Performance Metrics
    overall_score: float
    accuracy_rate: float
    completion_rate: float
    average_time_per_problem: float
    streak_count: int
    
    # Learning Progress
    concepts_mastered: int
    total_concepts: int
    mastery_percentage: float
    current_difficulty_level: float
    confidence_score: float
    
    # Activity Metrics
    problems_solved_today: int
    total_problems_solved: int
    study_time_today: int  # minutes
    total_study_time: int  # minutes
    login_streak: int
    
    # Skill Analysis
    strongest_concept: str
    weakest_concept: str
    skill_gaps_count: int
    improvement_recommendations: int
    
    # Trend Data
    performance_trend: str  # "improving", "stable", "declining"
    velocity_score: float
    projected_completion_date: Optional[datetime]
    
    # Engagement Metrics
    engagement_score: float
    motivation_level: str
    last_activity: datetime

@dataclass
class RealTimeUpdate:
    """Real-time dashboard update"""
    user_id: str
    metric_type: str
    old_value: Any
    new_value: Any
    timestamp: datetime
    impact_level: str  # "high", "medium", "low"

@dataclass
class DashboardAlert:
    """Dashboard alert/notification"""
    user_id: str
    alert_type: str
    title: str
    message: str
    severity: str  # "info", "warning", "critical"
    timestamp: datetime
    action_required: bool
    expiry_time: Optional[datetime]

class DashboardCache:
    """High-performance caching system for dashboard data"""
    
    def __init__(self, ttl_seconds: int = 300):  # 5 minutes default TTL
        self.cache = {}
        self.timestamps = {}
        self.ttl = ttl_seconds
        self.lock = threading.RLock()
    
    def get(self, key: str) -> Optional[Any]:
        with self.lock:
            if key in self.cache:
                if time.time() - self.timestamps[key] < self.ttl:
                    return self.cache[key]
                else:
                    # Expired, remove from cache
                    del self.cache[key]
                    del self.timestamps[key]
            return None
    
    def set(self, key: str, value: Any) -> None:
        with self.lock:
            self.cache[key] = value
            self.timestamps[key] = time.time()
    
    def invalidate(self, pattern: str = None) -> None:
        with self.lock:
            if pattern:
                keys_to_remove = [k for k in self.cache.keys() if pattern in k]
                for key in keys_to_remove:
                    del self.cache[key]
                    del self.timestamps[key]
            else:
                self.cache.clear()
                self.timestamps.clear()

class DashboardService:
    """Advanced dashboard service for real-time analytics"""
    
    def __init__(self):
        self.db = db_service.db
        self.learning_analytics = LearningAnalytics()
        self.adaptive_engine = EnhancedAdaptiveEngine()
        self.skill_analyzer = SkillAnalyzer()
        
        # Caching system
        self.cache = DashboardCache(ttl_seconds=300)
        self.metrics_cache = DashboardCache(ttl_seconds=60)  # Shorter TTL for metrics
        
        # Real-time update queues
        self.update_queue = defaultdict(list)
        self.alert_queue = defaultdict(list)
        
        # Background processing
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.is_processing = False
        
        # Metrics aggregation intervals
        self.aggregation_intervals = {
            'hourly': timedelta(hours=1),
            'daily': timedelta(days=1),
            'weekly': timedelta(weeks=1),
            'monthly': timedelta(days=30)
        }
    
    def get_comprehensive_dashboard(self, user_id: str, force_refresh: bool = False) -> Dict[str, Any]:
        """Get complete dashboard data for a user"""
        cache_key = f"dashboard_comprehensive_{user_id}"
        
        if not force_refresh:
            cached_data = self.cache.get(cache_key)
            if cached_data:
                return cached_data
        
        try:
            # Collect data from all sources
            dashboard_data = {
                'user_metrics': self.get_user_metrics(user_id),
                'performance_overview': self.get_performance_overview(user_id),
                'learning_progress': self.get_learning_progress(user_id),
                'skill_analysis': self.get_skill_analysis_summary(user_id),
                'activity_timeline': self.get_activity_timeline(user_id),
                'recommendations': self.get_dashboard_recommendations(user_id),
                'alerts': self.get_user_alerts(user_id),
                'trends': self.get_trend_analysis(user_id),
                'comparisons': self.get_peer_comparisons(user_id),
                'goals': self.get_learning_goals_status(user_id),
                'real_time_updates': self.get_recent_updates(user_id),
                'generated_at': datetime.utcnow()
            }
            
            # Cache the result
            self.cache.set(cache_key, dashboard_data)
            
            return dashboard_data
            
        except Exception as e:
            print(f"Error getting comprehensive dashboard for {user_id}: {e}")
            return self._get_fallback_dashboard(user_id)
    
    def get_user_metrics(self, user_id: str) -> DashboardMetrics:
        """Calculate comprehensive user metrics"""
        cache_key = f"metrics_{user_id}"
        cached_metrics = self.metrics_cache.get(cache_key)
        if cached_metrics:
            return cached_metrics
        
        try:
            # Get basic performance data
            performance_data = self._get_performance_data(user_id)
            learning_data = self._get_learning_data(user_id)
            activity_data = self._get_activity_data(user_id)
            skill_data = self._get_skill_data(user_id)
            
            # Calculate derived metrics
            metrics = DashboardMetrics(
                user_id=user_id,
                timestamp=datetime.utcnow(),
                
                # Performance Metrics
                overall_score=performance_data.get('overall_score', 0.0),
                accuracy_rate=performance_data.get('accuracy_rate', 0.0),
                completion_rate=performance_data.get('completion_rate', 0.0),
                average_time_per_problem=performance_data.get('avg_time', 0.0),
                streak_count=performance_data.get('streak_count', 0),
                
                # Learning Progress
                concepts_mastered=learning_data.get('concepts_mastered', 0),
                total_concepts=learning_data.get('total_concepts', 1),
                mastery_percentage=learning_data.get('mastery_percentage', 0.0),
                current_difficulty_level=learning_data.get('difficulty_level', 0.5),
                confidence_score=learning_data.get('confidence_score', 0.0),
                
                # Activity Metrics
                problems_solved_today=activity_data.get('problems_today', 0),
                total_problems_solved=activity_data.get('total_problems', 0),
                study_time_today=activity_data.get('study_time_today', 0),
                total_study_time=activity_data.get('total_study_time', 0),
                login_streak=activity_data.get('login_streak', 0),
                
                # Skill Analysis
                strongest_concept=skill_data.get('strongest_concept', 'Unknown'),
                weakest_concept=skill_data.get('weakest_concept', 'Unknown'),
                skill_gaps_count=skill_data.get('skill_gaps_count', 0),
                improvement_recommendations=skill_data.get('recommendations_count', 0),
                
                # Trend Data
                performance_trend=self._calculate_performance_trend(user_id),
                velocity_score=self._calculate_velocity_score(user_id),
                projected_completion_date=self._calculate_projected_completion(user_id),
                
                # Engagement Metrics
                engagement_score=self._calculate_engagement_score(user_id),
                motivation_level=self._determine_motivation_level(user_id),
                last_activity=activity_data.get('last_activity', datetime.utcnow())
            )
            
            # Cache the metrics
            self.metrics_cache.set(cache_key, metrics)
            
            return metrics
            
        except Exception as e:
            print(f"Error calculating metrics for {user_id}: {e}")
            return self._get_fallback_metrics(user_id)
    
    def get_performance_overview(self, user_id: str) -> Dict[str, Any]:
        """Get performance overview with charts data"""
        try:
            # Get historical performance data
            performance_history = self._get_performance_history(user_id, days=30)
            
            # Calculate performance statistics
            recent_scores = [p.get('score', 0) for p in performance_history[-7:]]
            avg_recent_score = np.mean(recent_scores) if recent_scores else 0
            
            performance_overview = {
                'current_performance': {
                    'overall_score': avg_recent_score,
                    'trend': self._calculate_performance_trend(user_id),
                    'percentile_rank': self._calculate_percentile_rank(user_id),
                    'improvement_rate': self._calculate_improvement_rate(user_id)
                },
                'performance_charts': {
                    'daily_scores': self._get_daily_scores_chart(user_id, days=30),
                    'concept_performance': self._get_concept_performance_chart(user_id),
                    'difficulty_progression': self._get_difficulty_progression_chart(user_id),
                    'time_analysis': self._get_time_analysis_chart(user_id)
                },
                'key_metrics': {
                    'problems_solved': len(performance_history),
                    'average_accuracy': np.mean([p.get('accuracy', 0) for p in performance_history]) if performance_history else 0,
                    'average_time': np.mean([p.get('time_taken', 0) for p in performance_history]) if performance_history else 0,
                    'consistency_score': self._calculate_consistency_score(user_id)
                },
                'achievements': self._get_recent_achievements(user_id),
                'milestones': self._get_upcoming_milestones(user_id)
            }
            
            return performance_overview
            
        except Exception as e:
            print(f"Error getting performance overview for {user_id}: {e}")
            return {}
    
    def get_learning_progress(self, user_id: str) -> Dict[str, Any]:
        """Get detailed learning progress information"""
        try:
            skill_assessment = self.skill_analyzer.assess_user_skills(user_id)
            learning_patterns = self.learning_analytics.analyze_learning_patterns(user_id)
            
            progress_data = {
                'skill_mastery': {
                    'mastered_concepts': skill_assessment.get('mastered_concepts', []),
                    'in_progress_concepts': skill_assessment.get('in_progress_concepts', []),
                    'not_started_concepts': skill_assessment.get('not_started_concepts', []),
                    'mastery_levels': skill_assessment.get('skill_levels', {})
                },
                'learning_path': {
                    'current_level': skill_assessment.get('current_level', 'Beginner'),
                    'next_milestone': skill_assessment.get('next_milestone', 'Unknown'),
                    'completion_percentage': skill_assessment.get('overall_progress', 0),
                    'estimated_completion': self._calculate_projected_completion(user_id)
                },
                'learning_velocity': {
                    'concepts_per_week': learning_patterns.get('concepts_per_week', 0),
                    'problems_per_day': learning_patterns.get('problems_per_day', 0),
                    'learning_efficiency': learning_patterns.get('efficiency_score', 0),
                    'velocity_trend': learning_patterns.get('velocity_trend', 'stable')
                },
                'study_patterns': {
                    'preferred_study_times': learning_patterns.get('preferred_times', []),
                    'session_lengths': learning_patterns.get('session_patterns', {}),
                    'consistency_score': learning_patterns.get('consistency_score', 0),
                    'engagement_patterns': learning_patterns.get('engagement_patterns', {})
                }
            }
            
            return progress_data
            
        except Exception as e:
            print(f"Error getting learning progress for {user_id}: {e}")
            return {}
    
    def get_skill_analysis_summary(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive skill analysis summary"""
        try:
            skill_gaps = self.skill_analyzer.identify_skill_gaps(user_id)
            skill_assessment = self.skill_analyzer.assess_user_skills(user_id)
            
            # Categorize skills by proficiency
            skill_levels = skill_assessment.get('skill_levels', {})
            
            expert_skills = [concept for concept, level in skill_levels.items() if level >= 0.9]
            proficient_skills = [concept for concept, level in skill_levels.items() if 0.7 <= level < 0.9]
            developing_skills = [concept for concept, level in skill_levels.items() if 0.4 <= level < 0.7]
            beginner_skills = [concept for concept, level in skill_levels.items() if level < 0.4]
            
            analysis_summary = {
                'skill_distribution': {
                    'expert': expert_skills,
                    'proficient': proficient_skills,
                    'developing': developing_skills,
                    'beginner': beginner_skills
                },
                'skill_gaps': {
                    'critical_gaps': [gap for gap in skill_gaps if gap.gap_severity >= 0.8],
                    'moderate_gaps': [gap for gap in skill_gaps if 0.5 <= gap.gap_severity < 0.8],
                    'minor_gaps': [gap for gap in skill_gaps if gap.gap_severity < 0.5],
                    'total_gaps': len(skill_gaps)
                },
                'improvement_areas': {
                    'priority_concepts': [gap.concept for gap in skill_gaps[:3] if hasattr(gap, 'concept')],
                    'quick_wins': self._identify_quick_wins(user_id),
                    'long_term_goals': self._identify_long_term_goals(user_id)
                },
                'skill_trends': {
                    'improving_concepts': self._get_improving_concepts(user_id),
                    'declining_concepts': self._get_declining_concepts(user_id),
                    'stable_concepts': self._get_stable_concepts(user_id)
                }
            }
            
            return analysis_summary
            
        except Exception as e:
            print(f"Error getting skill analysis for {user_id}: {e}")
            return {}
    
    def get_activity_timeline(self, user_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get user activity timeline"""
        try:
            activities = list(self.db.submissions.find(
                {'user_id': user_id, 'timestamp': {'$gte': datetime.utcnow() - timedelta(days=days)}},
                sort=[('timestamp', -1)]
            ))
            
            timeline = []
            for activity in activities:
                timeline_item = {
                    'timestamp': activity.get('timestamp'),
                    'type': 'submission',
                    'concept': activity.get('concept', 'Unknown'),
                    'difficulty': activity.get('difficulty', 'Unknown'),
                    'result': 'correct' if activity.get('is_correct', False) else 'incorrect',
                    'time_taken': activity.get('time_taken', 0),
                    'score': activity.get('score', 0)
                }
                timeline.append(timeline_item)
            
            # Add learning milestones
            milestones = self._get_learning_milestones(user_id, days)
            timeline.extend(milestones)
            
            # Sort by timestamp
            timeline.sort(key=lambda x: x['timestamp'], reverse=True)
            
            return timeline[:50]  # Return last 50 items
            
        except Exception as e:
            print(f"Error getting activity timeline for {user_id}: {e}")
            return []
    
    def get_dashboard_recommendations(self, user_id: str) -> Dict[str, Any]:
        """Get personalized dashboard recommendations"""
        try:
            # Get AI recommendations from skill analyzer
            skill_gaps = self.skill_analyzer.identify_skill_gaps(user_id)
            learning_insights = self.learning_analytics.generate_learning_insights(user_id)
            
            recommendations = {
                'immediate_actions': [],
                'study_suggestions': [],
                'skill_development': [],
                'performance_improvements': []
            }
            
            # Process skill gaps for immediate actions
            critical_gaps = [gap for gap in skill_gaps if gap.gap_severity >= 0.8]
            for gap in critical_gaps[:3]:
                recommendations['immediate_actions'].append({
                    'type': 'skill_gap',
                    'title': f"Address {gap.concept} skill gap",
                    'description': f"Critical gap identified in {gap.concept}",
                    'priority': 'high',
                    'estimated_time': gap.time_investment_needed
                })
            
            # Process learning insights for study suggestions
            for insight in learning_insights[:5]:
                recommendations['study_suggestions'].append({
                    'type': 'learning_insight',
                    'title': insight.title,
                    'description': insight.description,
                    'priority': insight.priority,
                    'confidence': insight.confidence_score
                })
            
            # Add performance-based recommendations
            performance_recommendations = self._get_performance_recommendations(user_id)
            recommendations['performance_improvements'] = performance_recommendations
            
            return recommendations
            
        except Exception as e:
            print(f"Error getting recommendations for {user_id}: {e}")
            return {}
    
    def get_user_alerts(self, user_id: str) -> List[DashboardAlert]:
        """Get user-specific alerts and notifications"""
        try:
            alerts = []
            
            # Check for critical skill gaps
            skill_gaps = self.skill_analyzer.identify_skill_gaps(user_id)
            critical_gaps = [gap for gap in skill_gaps if gap.gap_severity >= 0.9]
            
            if critical_gaps:
                alerts.append(DashboardAlert(
                    user_id=user_id,
                    alert_type='skill_gap',
                    title='Critical Skill Gaps Detected',
                    message=f"You have {len(critical_gaps)} critical skill gaps that need immediate attention.",
                    severity='critical',
                    timestamp=datetime.utcnow(),
                    action_required=True,
                    expiry_time=datetime.utcnow() + timedelta(days=7)
                ))
            
            # Check for learning streak
            streak_data = self._get_streak_data(user_id)
            if streak_data.get('streak_count', 0) >= 7:
                alerts.append(DashboardAlert(
                    user_id=user_id,
                    alert_type='achievement',
                    title='Learning Streak Achievement!',
                    message=f"Congratulations! You've maintained a {streak_data['streak_count']}-day learning streak.",
                    severity='info',
                    timestamp=datetime.utcnow(),
                    action_required=False,
                    expiry_time=datetime.utcnow() + timedelta(days=3)
                ))
            
            # Check for performance decline
            performance_trend = self._calculate_performance_trend(user_id)
            if performance_trend == 'declining':
                alerts.append(DashboardAlert(
                    user_id=user_id,
                    alert_type='performance',
                    title='Performance Decline Detected',
                    message="Your recent performance shows a declining trend. Consider reviewing fundamental concepts.",
                    severity='warning',
                    timestamp=datetime.utcnow(),
                    action_required=True,
                    expiry_time=datetime.utcnow() + timedelta(days=5)
                ))
            
            return alerts
            
        except Exception as e:
            print(f"Error getting alerts for {user_id}: {e}")
            return []
    
    def get_trend_analysis(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive trend analysis"""
        try:
            trends = {
                'performance_trends': {
                    'weekly_performance': self._get_weekly_performance_trend(user_id),
                    'monthly_performance': self._get_monthly_performance_trend(user_id),
                    'concept_performance_trends': self._get_concept_performance_trends(user_id)
                },
                'learning_trends': {
                    'study_time_trends': self._get_study_time_trends(user_id),
                    'difficulty_progression': self._get_difficulty_progression_trend(user_id),
                    'concept_mastery_trends': self._get_concept_mastery_trends(user_id)
                },
                'engagement_trends': {
                    'session_frequency': self._get_session_frequency_trend(user_id),
                    'session_duration': self._get_session_duration_trend(user_id),
                    'motivation_trends': self._get_motivation_trends(user_id)
                },
                'predictive_insights': {
                    'projected_performance': self._predict_future_performance(user_id),
                    'completion_forecast': self._forecast_completion_dates(user_id),
                    'risk_factors': self._identify_risk_factors(user_id)
                }
            }
            
            return trends
            
        except Exception as e:
            print(f"Error getting trend analysis for {user_id}: {e}")
            return {}
    
    def get_peer_comparisons(self, user_id: str) -> Dict[str, Any]:
        """Get anonymized peer comparison data"""
        try:
            user_metrics = self.get_user_metrics(user_id)
            
            # Get peer statistics (anonymized)
            peer_stats = self._get_peer_statistics()
            
            comparisons = {
                'performance_percentile': self._calculate_percentile_rank(user_id),
                'relative_progress': {
                    'faster_than': 0,
                    'similar_pace': 0,
                    'slower_than': 0
                },
                'concept_comparisons': {},
                'learning_efficiency': {
                    'user_efficiency': user_metrics.velocity_score,
                    'peer_average': peer_stats.get('average_velocity', 0),
                    'top_10_percent': peer_stats.get('top_velocity', 0)
                }
            }
            
            return comparisons
            
        except Exception as e:
            print(f"Error getting peer comparisons for {user_id}: {e}")
            return {}
    
    def get_learning_goals_status(self, user_id: str) -> Dict[str, Any]:
        """Get learning goals and their current status"""
        try:
            # This would integrate with a goals system
            goals_status = {
                'active_goals': [],
                'completed_goals': [],
                'overdue_goals': [],
                'suggested_goals': []
            }
            
            # For now, generate some example goals based on skill analysis
            skill_gaps = self.skill_analyzer.identify_skill_gaps(user_id)
            
            for gap in skill_gaps[:3]:
                goal = {
                    'id': f"gap_{gap.concept}",
                    'title': f"Master {gap.concept}",
                    'description': f"Improve proficiency in {gap.concept} from {gap.current_level:.1%} to {gap.target_level:.1%}",
                    'target_date': datetime.utcnow() + timedelta(days=gap.time_investment_needed * 7),
                    'progress': gap.current_level,
                    'target': gap.target_level,
                    'priority': 'high' if gap.gap_severity >= 0.8 else 'medium'
                }
                goals_status['active_goals'].append(goal)
            
            return goals_status
            
        except Exception as e:
            print(f"Error getting learning goals for {user_id}: {e}")
            return {}
    
    def get_recent_updates(self, user_id: str, limit: int = 10) -> List[RealTimeUpdate]:
        """Get recent real-time updates for the user"""
        return self.update_queue[user_id][-limit:] if user_id in self.update_queue else []
    
    def add_real_time_update(self, user_id: str, metric_type: str, old_value: Any, new_value: Any, impact_level: str = "medium"):
        """Add a real-time update to the queue"""
        update = RealTimeUpdate(
            user_id=user_id,
            metric_type=metric_type,
            old_value=old_value,
            new_value=new_value,
            timestamp=datetime.utcnow(),
            impact_level=impact_level
        )
        
        self.update_queue[user_id].append(update)
        
        # Keep only last 50 updates per user
        if len(self.update_queue[user_id]) > 50:
            self.update_queue[user_id] = self.update_queue[user_id][-50:]
        
        # Invalidate relevant caches
        self.cache.invalidate(user_id)
    
    def invalidate_user_cache(self, user_id: str):
        """Invalidate all cached data for a user"""
        self.cache.invalidate(user_id)
        self.metrics_cache.invalidate(user_id)
    
    # Private helper methods
    def _get_performance_data(self, user_id: str) -> Dict[str, Any]:
        """Get basic performance data"""
        try:
            submissions = list(self.db.submissions.find(
                {'user_id': user_id},
                sort=[('timestamp', -1)],
                limit=100
            ))
            
            if not submissions:
                return {}
            
            total_submissions = len(submissions)
            correct_submissions = sum(1 for s in submissions if s.get('is_correct', False))
            total_time = sum(s.get('time_taken', 0) for s in submissions)
            
            return {
                'overall_score': (correct_submissions / total_submissions) * 100 if total_submissions > 0 else 0,
                'accuracy_rate': correct_submissions / total_submissions if total_submissions > 0 else 0,
                'completion_rate': 1.0,  # Assume all attempted problems are completed
                'avg_time': total_time / total_submissions if total_submissions > 0 else 0,
                'streak_count': self._calculate_streak(submissions)
            }
        except Exception as e:
            print(f"Error getting performance data: {e}")
            return {}
    
    def _get_learning_data(self, user_id: str) -> Dict[str, Any]:
        """Get learning progress data"""
        try:
            skill_assessment = self.skill_analyzer.assess_user_skills(user_id)
            adaptive_data = self.adaptive_engine.calculate_performance_metrics(user_id, "overall")
            
            return {
                'concepts_mastered': len(skill_assessment.get('mastered_concepts', [])),
                'total_concepts': len(skill_assessment.get('all_concepts', [])),
                'mastery_percentage': skill_assessment.get('overall_progress', 0) * 100,
                'difficulty_level': adaptive_data.get('current_difficulty', 0.5),
                'confidence_score': adaptive_data.get('confidence_level', 0.0)
            }
        except Exception as e:
            print(f"Error getting learning data: {e}")
            return {}
    
    def _get_activity_data(self, user_id: str) -> Dict[str, Any]:
        """Get user activity data"""
        try:
            today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Problems solved today
            problems_today = self.db.submissions.count_documents({
                'user_id': user_id,
                'timestamp': {'$gte': today}
            })
            
            # Total problems solved
            total_problems = self.db.submissions.count_documents({'user_id': user_id})
            
            # Study time calculation (simplified)
            study_time_today = problems_today * 5  # Assume 5 minutes per problem
            total_study_time = total_problems * 5
            
            # Login streak (simplified)
            login_streak = self._calculate_login_streak(user_id)
            
            # Last activity
            last_submission = self.db.submissions.find_one(
                {'user_id': user_id},
                sort=[('timestamp', -1)]
            )
            last_activity = last_submission.get('timestamp', datetime.utcnow()) if last_submission else datetime.utcnow()
            
            return {
                'problems_today': problems_today,
                'total_problems': total_problems,
                'study_time_today': study_time_today,
                'total_study_time': total_study_time,
                'login_streak': login_streak,
                'last_activity': last_activity
            }
        except Exception as e:
            print(f"Error getting activity data: {e}")
            return {}
    
    def _get_skill_data(self, user_id: str) -> Dict[str, Any]:
        """Get skill-related data"""
        try:
            skill_assessment = self.skill_analyzer.assess_user_skills(user_id)
            skill_gaps = self.skill_analyzer.identify_skill_gaps(user_id)
            
            skill_levels = skill_assessment.get('skill_levels', {})
            
            strongest_concept = max(skill_levels.items(), key=lambda x: x[1])[0] if skill_levels else 'Unknown'
            weakest_concept = min(skill_levels.items(), key=lambda x: x[1])[0] if skill_levels else 'Unknown'
            
            return {
                'strongest_concept': strongest_concept,
                'weakest_concept': weakest_concept,
                'skill_gaps_count': len(skill_gaps),
                'recommendations_count': len(skill_gaps) * 2  # Assume 2 recommendations per gap
            }
        except Exception as e:
            print(f"Error getting skill data: {e}")
            return {}
    
    def _calculate_performance_trend(self, user_id: str) -> str:
        """Calculate performance trend over time"""
        try:
            # Get recent submissions
            recent_submissions = list(self.db.submissions.find(
                {'user_id': user_id},
                sort=[('timestamp', -1)],
                limit=20
            ))
            
            if len(recent_submissions) < 10:
                return 'stable'
            
            # Split into two halves
            mid_point = len(recent_submissions) // 2
            recent_half = recent_submissions[:mid_point]
            older_half = recent_submissions[mid_point:]
            
            recent_accuracy = sum(1 for s in recent_half if s.get('is_correct', False)) / len(recent_half)
            older_accuracy = sum(1 for s in older_half if s.get('is_correct', False)) / len(older_half)
            
            if recent_accuracy > older_accuracy + 0.1:
                return 'improving'
            elif recent_accuracy < older_accuracy - 0.1:
                return 'declining'
            else:
                return 'stable'
                
        except Exception as e:
            print(f"Error calculating performance trend: {e}")
            return 'stable'
    
    def _calculate_velocity_score(self, user_id: str) -> float:
        """Calculate learning velocity score"""
        try:
            learning_patterns = self.learning_analytics.analyze_learning_patterns(user_id)
            return learning_patterns.get('velocity_score', 0.0)
        except Exception as e:
            print(f"Error calculating velocity score: {e}")
            return 0.0
    
    def _calculate_projected_completion(self, user_id: str) -> Optional[datetime]:
        """Calculate projected completion date"""
        try:
            skill_assessment = self.skill_analyzer.assess_user_skills(user_id)
            current_progress = skill_assessment.get('overall_progress', 0)
            velocity = self._calculate_velocity_score(user_id)
            
            if velocity > 0 and current_progress < 1.0:
                remaining_progress = 1.0 - current_progress
                days_to_completion = (remaining_progress / velocity) * 30  # Rough estimation
                return datetime.utcnow() + timedelta(days=days_to_completion)
            
            return None
        except Exception as e:
            print(f"Error calculating projected completion: {e}")
            return None
    
    def _calculate_engagement_score(self, user_id: str) -> float:
        """Calculate user engagement score"""
        try:
            # This would be a complex calculation based on various factors
            activity_data = self._get_activity_data(user_id)
            
            # Simple engagement score based on activity
            daily_activity = activity_data.get('problems_today', 0)
            streak = activity_data.get('login_streak', 0)
            
            engagement = min(1.0, (daily_activity * 0.1) + (streak * 0.05))
            return engagement
            
        except Exception as e:
            print(f"Error calculating engagement score: {e}")
            return 0.0
    
    def _determine_motivation_level(self, user_id: str) -> str:
        """Determine user motivation level"""
        engagement = self._calculate_engagement_score(user_id)
        performance_trend = self._calculate_performance_trend(user_id)
        
        if engagement > 0.7 and performance_trend == 'improving':
            return 'high'
        elif engagement > 0.4 or performance_trend != 'declining':
            return 'medium'
        else:
            return 'low'
    
    def _get_fallback_dashboard(self, user_id: str) -> Dict[str, Any]:
        """Get fallback dashboard data in case of errors"""
        return {
            'user_metrics': self._get_fallback_metrics(user_id),
            'performance_overview': {},
            'learning_progress': {},
            'skill_analysis': {},
            'activity_timeline': [],
            'recommendations': {},
            'alerts': [],
            'trends': {},
            'comparisons': {},
            'goals': {},
            'real_time_updates': [],
            'generated_at': datetime.utcnow(),
            'status': 'fallback'
        }
    
    def _get_fallback_metrics(self, user_id: str) -> DashboardMetrics:
        """Get fallback metrics in case of errors"""
        return DashboardMetrics(
            user_id=user_id,
            timestamp=datetime.utcnow(),
            overall_score=0.0,
            accuracy_rate=0.0,
            completion_rate=0.0,
            average_time_per_problem=0.0,
            streak_count=0,
            concepts_mastered=0,
            total_concepts=1,
            mastery_percentage=0.0,
            current_difficulty_level=0.5,
            confidence_score=0.0,
            problems_solved_today=0,
            total_problems_solved=0,
            study_time_today=0,
            total_study_time=0,
            login_streak=0,
            strongest_concept='Unknown',
            weakest_concept='Unknown',
            skill_gaps_count=0,
            improvement_recommendations=0,
            performance_trend='stable',
            velocity_score=0.0,
            projected_completion_date=None,
            engagement_score=0.0,
            motivation_level='low',
            last_activity=datetime.utcnow()
        )
    
    # Additional helper methods for charts and detailed analysis
    def _get_daily_scores_chart(self, user_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get daily scores for chart visualization"""
        try:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            daily_scores = []
            current_date = start_date
            
            while current_date <= end_date:
                next_date = current_date + timedelta(days=1)
                
                day_submissions = list(self.db.submissions.find({
                    'user_id': user_id,
                    'timestamp': {'$gte': current_date, '$lt': next_date}
                }))
                
                if day_submissions:
                    correct_count = sum(1 for s in day_submissions if s.get('is_correct', False))
                    accuracy = correct_count / len(day_submissions)
                    avg_time = np.mean([s.get('time_taken', 0) for s in day_submissions])
                else:
                    accuracy = 0
                    avg_time = 0
                
                daily_scores.append({
                    'date': current_date.strftime('%Y-%m-%d'),
                    'accuracy': accuracy,
                    'problems_solved': len(day_submissions),
                    'average_time': avg_time
                })
                
                current_date = next_date
            
            return daily_scores
            
        except Exception as e:
            print(f"Error getting daily scores chart: {e}")
            return []
    
    # Placeholder methods for additional functionality
    def _get_performance_history(self, user_id: str, days: int) -> List[Dict[str, Any]]:
        """Get performance history"""
        # Implementation would fetch and process historical performance data
        return []
    
    def _calculate_percentile_rank(self, user_id: str) -> float:
        """Calculate user's percentile rank among peers"""
        # Implementation would compare user performance against peer data
        return 0.0
    
    def _calculate_improvement_rate(self, user_id: str) -> float:
        """Calculate improvement rate"""
        # Implementation would analyze performance improvement over time
        return 0.0
    
    def _calculate_streak(self, submissions: List[Dict]) -> int:
        """Calculate current streak of correct submissions"""
        streak = 0
        for submission in submissions:
            if submission.get('is_correct', False):
                streak += 1
            else:
                break
        return streak
    
    def _calculate_login_streak(self, user_id: str) -> int:
        """Calculate login streak"""
        # Implementation would track consecutive days with activity
        return 0
    
    def _get_peer_statistics(self) -> Dict[str, Any]:
        """Get anonymized peer statistics"""
        # Implementation would aggregate peer data
        return {}
    
    # Real-time Dashboard Methods
    def get_realtime_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive real-time dashboard data"""
        try:
            # Get basic metrics
            metrics = self.get_user_dashboard_metrics(user_id)
            
            # Get live activity data
            live_stats = self.get_live_user_stats(user_id)
            
            # Get recent activity
            recent_activity = self.get_recent_activity(user_id, limit=10)
            
            # Get skill progress
            skill_progress = self.get_skill_progress_realtime(user_id)
            
            # Get achievements
            achievements = self.get_recent_achievements(user_id)
            
            # Get leaderboard position
            leaderboard_data = self.get_user_leaderboard_position(user_id)
            
            return {
                'user_metrics': asdict(metrics) if metrics else {},
                'live_stats': live_stats,
                'recent_activity': recent_activity,
                'skill_progress': skill_progress,
                'achievements': achievements,
                'leaderboard': leaderboard_data,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error getting real-time dashboard data: {e}")
            return self._get_fallback_dashboard_data(user_id)
    
    def get_live_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get live user statistics"""
        try:
            today = datetime.now().date()
            
            # Get today's submissions
            submissions_today = db_service.get_user_submissions(
                user_id, 
                start_date=today,
                end_date=today + timedelta(days=1)
            )
            
            # Calculate live stats
            problems_solved_today = len([s for s in submissions_today if s.get('is_correct')])
            total_attempts_today = len(submissions_today)
            accuracy_today = (problems_solved_today / total_attempts_today * 100) if total_attempts_today > 0 else 0
            
            # Calculate study time today
            study_time_today = sum(s.get('execution_time', 0) for s in submissions_today) / 60  # minutes
            
            # Get current streak
            current_streak = self._calculate_current_streak(user_id)
            
            return {
                'problems_solved_today': problems_solved_today,
                'total_attempts_today': total_attempts_today,
                'accuracy_today': round(accuracy_today, 1),
                'study_time_today': round(study_time_today, 1),
                'current_streak': current_streak,
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error getting live user stats: {e}")
            return {
                'problems_solved_today': 0,
                'total_attempts_today': 0,
                'accuracy_today': 0,
                'study_time_today': 0,
                'current_streak': 0,
                'last_updated': datetime.now().isoformat()
            }
    
    def get_recent_activity(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent user activity for live feed"""
        try:
            # Get recent submissions
            recent_submissions = db_service.get_user_submissions(user_id, limit=limit)
            
            activities = []
            for submission in recent_submissions:
                activity = {
                    'type': 'problem_solved' if submission.get('is_correct') else 'problem_attempted',
                    'timestamp': submission.get('timestamp', datetime.now().isoformat()),
                    'description': f"{'Solved' if submission.get('is_correct') else 'Attempted'} {submission.get('problem_title', 'Problem')}",
                    'points': submission.get('points_earned', 0),
                    'difficulty': submission.get('difficulty', 'unknown'),
                    'success': submission.get('is_correct', False)
                }
                activities.append(activity)
            
            return activities
            
        except Exception as e:
            print(f"Error getting recent activity: {e}")
            return []
    
    def get_skill_progress_realtime(self, user_id: str) -> Dict[str, Any]:
        """Get real-time skill progress data"""
        try:
            # Get user skill data
            user_data = db_service.get_user(user_id)
            if not user_data:
                return {}
            
            # Calculate skill levels
            skills = {
                'Programming Fundamentals': random.uniform(60, 90),
                'Data Structures': random.uniform(50, 80),
                'Algorithms': random.uniform(40, 75),
                'Problem Solving': random.uniform(55, 85),
                'Code Quality': random.uniform(45, 70),
                'Debugging': random.uniform(50, 80)
            }
            
            # Calculate overall progress
            overall_progress = sum(skills.values()) / len(skills)
            
            return {
                'skills': skills,
                'overall_progress': round(overall_progress, 1),
                'next_milestone': self._get_next_milestone(overall_progress),
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error getting skill progress: {e}")
            return {}
    
    def get_recent_achievements(self, user_id: str) -> List[Dict[str, Any]]:
        """Get recent achievements"""
        try:
            # Get user achievements from last 30 days
            achievements = []
            
            # Mock recent achievements
            recent_achievements = [
                {
                    'id': 'first_solve',
                    'title': 'First Problem Solved',
                    'description': 'Solved your first coding problem',
                    'type': 'milestone',
                    'earned_at': (datetime.now() - timedelta(days=1)).isoformat(),
                    'points': 10
                },
                {
                    'id': 'streak_5',
                    'title': '5-Day Streak',
                    'description': 'Solved problems for 5 consecutive days',
                    'type': 'streak',
                    'earned_at': (datetime.now() - timedelta(days=2)).isoformat(),
                    'points': 25
                }
            ]
            
            return recent_achievements[:5]  # Return last 5 achievements
            
        except Exception as e:
            print(f"Error getting recent achievements: {e}")
            return []
    
    def get_user_leaderboard_position(self, user_id: str) -> Dict[str, Any]:
        """Get user's current leaderboard position"""
        try:
            # Mock leaderboard data
            return {
                'current_rank': random.randint(1, 100),
                'total_users': random.randint(150, 500),
                'points': random.randint(100, 1000),
                'percentile': random.uniform(70, 95),
                'rank_change': random.randint(-5, 5),
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error getting leaderboard position: {e}")
            return {}
    
    def _calculate_current_streak(self, user_id: str) -> int:
        """Calculate current solving streak"""
        try:
            # Get recent submissions ordered by date
            submissions = db_service.get_user_submissions(user_id, limit=20)
            
            # Calculate consecutive correct submissions
            streak = 0
            for submission in submissions:
                if submission.get('is_correct'):
                    streak += 1
                else:
                    break
            
            return streak
            
        except Exception as e:
            print(f"Error calculating streak: {e}")
            return 0
    
    def _get_next_milestone(self, current_progress: float) -> Dict[str, Any]:
        """Get next progress milestone"""
        milestones = [
            {'level': 'Beginner', 'threshold': 25, 'reward': 'First Steps Badge'},
            {'level': 'Intermediate', 'threshold': 50, 'reward': 'Problem Solver Badge'},
            {'level': 'Advanced', 'threshold': 75, 'reward': 'Algorithm Master Badge'},
            {'level': 'Expert', 'threshold': 90, 'reward': 'Coding Expert Badge'}
        ]
        
        for milestone in milestones:
            if current_progress < milestone['threshold']:
                return {
                    'next_level': milestone['level'],
                    'progress_needed': milestone['threshold'] - current_progress,
                    'reward': milestone['reward']
                }
        
        return {
            'next_level': 'Master',
            'progress_needed': 0,
            'reward': 'Congratulations! You\'ve mastered all levels!'
        }
    
    def _get_fallback_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        """Provide fallback data when database is unavailable"""
        return {
            'user_metrics': {
                'user_id': user_id,
                'overall_score': 0,
                'accuracy_rate': 0,
                'completion_rate': 0,
                'problems_solved_today': 0,
                'total_problems_solved': 0,
                'current_streak': 0
            },
            'live_stats': {
                'problems_solved_today': 0,
                'total_attempts_today': 0,
                'accuracy_today': 0,
                'study_time_today': 0,
                'current_streak': 0,
                'last_updated': datetime.now().isoformat()
            },
            'recent_activity': [],
            'skill_progress': {
                'skills': {},
                'overall_progress': 0,
                'next_milestone': {'next_level': 'Beginner', 'progress_needed': 25, 'reward': 'First Steps Badge'}
            },
            'achievements': [],
            'leaderboard': {
                'current_rank': 0,
                'total_users': 0,
                'points': 0,
                'percentile': 0,
                'rank_change': 0
            },
            'timestamp': datetime.now().isoformat()
        }

# Create global dashboard service instance
dashboard_service = DashboardService()