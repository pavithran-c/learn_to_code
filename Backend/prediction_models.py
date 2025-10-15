"""
Prediction Models - Phase 4: Advanced Analytics Dashboard
ML models for progress prediction and learning outcome forecasting
"""

import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any, Union
from dataclasses import dataclass, asdict
import json
import statistics
from collections import defaultdict, deque
import math
from enum import Enum

from database_service import db_service

class PredictionModel(Enum):
    """Available prediction models"""
    LINEAR_REGRESSION = "linear_regression"
    EXPONENTIAL_SMOOTHING = "exponential_smoothing"
    BAYESIAN_LEARNING = "bayesian_learning"
    MARKOV_CHAIN = "markov_chain"
    ENSEMBLE = "ensemble"

@dataclass
class PredictionResult:
    """Result from a prediction model"""
    model_type: str
    prediction_value: float
    confidence_interval: Tuple[float, float]
    confidence_level: float
    time_horizon: int  # days
    factors_considered: List[str]
    model_accuracy: float
    last_updated: datetime

@dataclass
class LearningTrajectory:
    """Predicted learning trajectory"""
    user_id: str
    current_skill_level: float
    predicted_milestones: List[Dict[str, Any]]
    completion_probability: float
    time_to_mastery: int  # days
    recommended_pace: str
    risk_factors: List[str]
    success_indicators: List[str]

@dataclass
class PerformanceForecast:
    """Performance forecast data"""
    metric_name: str
    current_value: float
    predictions: Dict[str, float]  # time_period -> predicted_value
    trend_analysis: Dict[str, Any]
    volatility_score: float
    prediction_accuracy: float

class PredictionModels:
    """Advanced ML models for learning prediction"""
    
    def __init__(self):
        self.db = db_service.db
        
        # Model parameters
        self.models = {
            PredictionModel.LINEAR_REGRESSION: self._linear_regression_model,
            PredictionModel.EXPONENTIAL_SMOOTHING: self._exponential_smoothing_model,
            PredictionModel.BAYESIAN_LEARNING: self._bayesian_learning_model,
            PredictionModel.MARKOV_CHAIN: self._markov_chain_model,
            PredictionModel.ENSEMBLE: self._ensemble_model
        }
        
        # Model weights for ensemble
        self.ensemble_weights = {
            PredictionModel.LINEAR_REGRESSION: 0.25,
            PredictionModel.EXPONENTIAL_SMOOTHING: 0.30,
            PredictionModel.BAYESIAN_LEARNING: 0.25,
            PredictionModel.MARKOV_CHAIN: 0.20
        }
        
        # Prediction horizons (in days)
        self.prediction_horizons = [7, 14, 30, 60, 90]
        
        # Feature importance weights
        self.feature_weights = {
            'recent_performance': 0.4,
            'learning_velocity': 0.3,
            'consistency': 0.2,
            'engagement': 0.1
        }
    
    def predict_learning_progress(self, user_id: str, time_horizon: int = 30, model_type: PredictionModel = PredictionModel.ENSEMBLE) -> PredictionResult:
        """Predict learning progress for a user"""
        try:
            # Collect user data for prediction
            user_data = self._collect_user_data(user_id)
            
            if not user_data or len(user_data['performance_history']) < 5:
                return self._get_default_prediction(user_id, time_horizon)
            
            # Use specified model
            model_func = self.models[model_type]
            prediction = model_func(user_data, time_horizon)
            
            # Calculate confidence interval
            confidence_interval = self._calculate_confidence_interval(prediction, user_data)
            
            # Determine factors considered
            factors = self._identify_prediction_factors(user_data)
            
            # Calculate model accuracy based on historical validation
            accuracy = self._calculate_model_accuracy(user_id, model_type)
            
            return PredictionResult(
                model_type=model_type.value,
                prediction_value=prediction,
                confidence_interval=confidence_interval,
                confidence_level=0.85,  # 85% confidence level
                time_horizon=time_horizon,
                factors_considered=factors,
                model_accuracy=accuracy,
                last_updated=datetime.utcnow()
            )
            
        except Exception as e:
            print(f"Error predicting progress for {user_id}: {e}")
            return self._get_default_prediction(user_id, time_horizon)
    
    def predict_learning_trajectory(self, user_id: str) -> LearningTrajectory:
        """Predict complete learning trajectory for a user"""
        try:
            user_data = self._collect_user_data(user_id)
            current_skill = self._calculate_current_skill_level(user_data)
            
            # Predict milestones
            milestones = self._predict_milestones(user_data)
            
            # Calculate completion probability
            completion_prob = self._calculate_completion_probability(user_data)
            
            # Estimate time to mastery
            time_to_mastery = self._estimate_time_to_mastery(user_data)
            
            # Determine recommended pace
            recommended_pace = self._determine_recommended_pace(user_data)
            
            # Identify risk factors
            risk_factors = self._identify_risk_factors(user_data)
            
            # Identify success indicators
            success_indicators = self._identify_success_indicators(user_data)
            
            return LearningTrajectory(
                user_id=user_id,
                current_skill_level=current_skill,
                predicted_milestones=milestones,
                completion_probability=completion_prob,
                time_to_mastery=time_to_mastery,
                recommended_pace=recommended_pace,
                risk_factors=risk_factors,
                success_indicators=success_indicators
            )
            
        except Exception as e:
            print(f"Error predicting trajectory for {user_id}: {e}")
            return self._get_default_trajectory(user_id)
    
    def forecast_performance_metrics(self, user_id: str, metrics: List[str] = None) -> List[PerformanceForecast]:
        """Forecast future performance metrics"""
        if metrics is None:
            metrics = ['accuracy', 'speed', 'consistency', 'overall_performance']
        
        forecasts = []
        
        try:
            user_data = self._collect_user_data(user_id)
            
            for metric in metrics:
                forecast = self._forecast_single_metric(user_data, metric)
                forecasts.append(forecast)
            
            return forecasts
            
        except Exception as e:
            print(f"Error forecasting metrics for {user_id}: {e}")
            return [self._get_default_forecast(metric) for metric in metrics]
    
    def predict_concept_mastery(self, user_id: str, concept: str) -> Dict[str, Any]:
        """Predict when a user will master a specific concept"""
        try:
            concept_data = self._collect_concept_data(user_id, concept)
            
            if not concept_data:
                return {}
            
            # Current mastery level
            current_mastery = concept_data.get('current_level', 0.0)
            
            # Predict mastery timeline
            mastery_prediction = self._predict_concept_timeline(concept_data)
            
            # Calculate required effort
            required_effort = self._calculate_required_effort(concept_data)
            
            # Predict difficulty curve
            difficulty_curve = self._predict_difficulty_curve(concept_data)
            
            # Success probability
            success_probability = self._calculate_concept_success_probability(concept_data)
            
            return {
                'concept': concept,
                'current_mastery_level': current_mastery,
                'predicted_mastery_date': mastery_prediction['date'],
                'confidence': mastery_prediction['confidence'],
                'required_practice_hours': required_effort['hours'],
                'required_problems': required_effort['problems'],
                'difficulty_progression': difficulty_curve,
                'success_probability': success_probability,
                'blocking_factors': concept_data.get('blocking_factors', []),
                'accelerating_factors': concept_data.get('accelerating_factors', [])
            }
            
        except Exception as e:
            print(f"Error predicting concept mastery for {concept}: {e}")
            return {}
    
    def predict_optimal_study_schedule(self, user_id: str) -> Dict[str, Any]:
        """Predict optimal study schedule for maximum learning efficiency"""
        try:
            user_data = self._collect_user_data(user_id)
            
            # Analyze learning patterns
            learning_patterns = self._analyze_learning_patterns(user_data)
            
            # Predict optimal study times
            optimal_times = self._predict_optimal_study_times(learning_patterns)
            
            # Predict optimal session length
            optimal_session_length = self._predict_optimal_session_length(learning_patterns)
            
            # Predict optimal break intervals
            optimal_breaks = self._predict_optimal_breaks(learning_patterns)
            
            # Predict weekly study distribution
            weekly_distribution = self._predict_weekly_distribution(learning_patterns)
            
            return {
                'optimal_study_times': optimal_times,
                'optimal_session_length': optimal_session_length,
                'recommended_breaks': optimal_breaks,
                'weekly_distribution': weekly_distribution,
                'predicted_efficiency_gain': self._calculate_efficiency_gain(user_data),
                'adaptation_period': 14,  # days to adapt to new schedule
                'success_indicators': [
                    'Increased accuracy in target time slots',
                    'Reduced fatigue indicators',
                    'Improved consistency scores'
                ]
            }
            
        except Exception as e:
            print(f"Error predicting study schedule for {user_id}: {e}")
            return {}
    
    def predict_learning_outcomes(self, user_id: str, intervention: Dict[str, Any]) -> Dict[str, Any]:
        """Predict learning outcomes given a specific intervention"""
        try:
            user_data = self._collect_user_data(user_id)
            baseline_prediction = self.predict_learning_progress(user_id)
            
            # Model the intervention effect
            intervention_effect = self._model_intervention_effect(user_data, intervention)
            
            # Predict new outcomes
            modified_prediction = self._apply_intervention_effect(baseline_prediction, intervention_effect)
            
            # Calculate improvement metrics
            improvement_metrics = self._calculate_improvement_metrics(baseline_prediction, modified_prediction)
            
            return {
                'baseline_prediction': {
                    'progress_rate': baseline_prediction.prediction_value,
                    'time_to_mastery': self._estimate_time_to_mastery(user_data)
                },
                'with_intervention': {
                    'progress_rate': modified_prediction['progress_rate'],
                    'time_to_mastery': modified_prediction['time_to_mastery'],
                    'improvement_percentage': improvement_metrics['improvement_percentage']
                },
                'intervention_details': intervention,
                'success_probability': modified_prediction['success_probability'],
                'risk_mitigation': intervention_effect.get('risk_mitigation', []),
                'expected_roi': self._calculate_intervention_roi(improvement_metrics, intervention)
            }
            
        except Exception as e:
            print(f"Error predicting intervention outcomes for {user_id}: {e}")
            return {}
    
    # Model Implementations
    def _linear_regression_model(self, user_data: Dict[str, Any], time_horizon: int) -> float:
        """Linear regression prediction model"""
        performance_history = user_data['performance_history']
        
        if len(performance_history) < 3:
            return 0.5
        
        # Extract time series data
        x_values = list(range(len(performance_history)))
        y_values = [p['accuracy'] for p in performance_history]
        
        # Calculate linear regression
        n = len(x_values)
        sum_x = sum(x_values)
        sum_y = sum(y_values)
        sum_xy = sum(x * y for x, y in zip(x_values, y_values))
        sum_x2 = sum(x * x for x in x_values)
        
        if (n * sum_x2 - sum_x * sum_x) == 0:
            return statistics.mean(y_values)
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
        intercept = (sum_y - slope * sum_x) / n
        
        # Predict future value
        future_x = len(performance_history) + (time_horizon / 7)  # Convert to weeks
        prediction = slope * future_x + intercept
        
        return max(0.0, min(1.0, prediction))
    
    def _exponential_smoothing_model(self, user_data: Dict[str, Any], time_horizon: int) -> float:
        """Exponential smoothing prediction model"""
        performance_history = user_data['performance_history']
        
        if not performance_history:
            return 0.5
        
        alpha = 0.3  # Smoothing parameter
        values = [p['accuracy'] for p in performance_history]
        
        # Apply exponential smoothing
        smoothed = values[0]
        for value in values[1:]:
            smoothed = alpha * value + (1 - alpha) * smoothed
        
        # Apply trend component
        if len(values) >= 2:
            trend = (values[-1] - values[-2]) * (time_horizon / 7)
            prediction = smoothed + trend
        else:
            prediction = smoothed
        
        return max(0.0, min(1.0, prediction))
    
    def _bayesian_learning_model(self, user_data: Dict[str, Any], time_horizon: int) -> float:
        """Bayesian learning prediction model"""
        performance_history = user_data['performance_history']
        
        if not performance_history:
            return 0.5
        
        # Prior belief (assume average learner)
        prior_mean = 0.6
        prior_confidence = 0.1
        
        # Update with observed data
        observations = [p['accuracy'] for p in performance_history]
        n_observations = len(observations)
        observed_mean = statistics.mean(observations)
        
        # Bayesian update
        posterior_confidence = 1 / (1/prior_confidence + n_observations * 0.1)
        posterior_mean = posterior_confidence * (prior_mean/prior_confidence + sum(observations) * 0.1)
        
        # Apply learning curve effect
        learning_factor = 1 + (time_horizon / 30) * 0.1  # Gradual improvement
        prediction = posterior_mean * learning_factor
        
        return max(0.0, min(1.0, prediction))
    
    def _markov_chain_model(self, user_data: Dict[str, Any], time_horizon: int) -> float:
        """Markov chain prediction model"""
        performance_history = user_data['performance_history']
        
        if len(performance_history) < 3:
            return 0.5
        
        # Define performance states
        states = ['low', 'medium', 'high']
        
        # Convert performance to states
        state_sequence = []
        for p in performance_history:
            if p['accuracy'] < 0.5:
                state_sequence.append('low')
            elif p['accuracy'] < 0.8:
                state_sequence.append('medium')
            else:
                state_sequence.append('high')
        
        # Build transition matrix
        transitions = defaultdict(lambda: defaultdict(int))
        for i in range(len(state_sequence) - 1):
            current_state = state_sequence[i]
            next_state = state_sequence[i + 1]
            transitions[current_state][next_state] += 1
        
        # Convert to probabilities
        transition_probs = {}
        for state in states:
            total = sum(transitions[state].values())
            if total > 0:
                transition_probs[state] = {s: transitions[state][s] / total for s in states}
            else:
                transition_probs[state] = {s: 1/3 for s in states}  # Uniform distribution
        
        # Predict future state
        current_state = state_sequence[-1]
        steps = max(1, time_horizon // 7)  # Weekly steps
        
        state_probs = {current_state: 1.0}
        for _ in range(steps):
            new_probs = defaultdict(float)
            for state, prob in state_probs.items():
                for next_state, trans_prob in transition_probs[state].items():
                    new_probs[next_state] += prob * trans_prob
            state_probs = dict(new_probs)
        
        # Convert state probabilities to performance prediction
        state_values = {'low': 0.3, 'medium': 0.65, 'high': 0.9}
        prediction = sum(state_probs.get(state, 0) * value for state, value in state_values.items())
        
        return max(0.0, min(1.0, prediction))
    
    def _ensemble_model(self, user_data: Dict[str, Any], time_horizon: int) -> float:
        """Ensemble prediction combining multiple models"""
        predictions = {}
        
        # Get predictions from individual models
        for model_type in [PredictionModel.LINEAR_REGRESSION, PredictionModel.EXPONENTIAL_SMOOTHING, 
                          PredictionModel.BAYESIAN_LEARNING, PredictionModel.MARKOV_CHAIN]:
            model_func = self.models[model_type]
            predictions[model_type] = model_func(user_data, time_horizon)
        
        # Weighted ensemble
        ensemble_prediction = sum(
            predictions[model] * self.ensemble_weights[model] 
            for model in predictions
        )
        
        return max(0.0, min(1.0, ensemble_prediction))
    
    # Helper Methods
    def _collect_user_data(self, user_id: str) -> Dict[str, Any]:
        """Collect comprehensive user data for prediction"""
        try:
            # Get submissions
            submissions = list(self.db.submissions.find(
                {'user_id': user_id},
                sort=[('timestamp', 1)]
            ))
            
            if not submissions:
                return {}
            
            # Process performance history
            performance_history = []
            for submission in submissions:
                performance_history.append({
                    'timestamp': submission.get('timestamp', datetime.utcnow()),
                    'accuracy': 1.0 if submission.get('is_correct', False) else 0.0,
                    'time_taken': submission.get('time_taken', 0),
                    'difficulty': submission.get('difficulty', 'medium'),
                    'concept': submission.get('concept', 'unknown')
                })
            
            # Calculate derived metrics
            recent_performance = performance_history[-10:] if len(performance_history) >= 10 else performance_history
            learning_velocity = self._calculate_learning_velocity(performance_history)
            consistency = self._calculate_consistency(performance_history)
            engagement = self._calculate_engagement(user_id)
            
            return {
                'user_id': user_id,
                'performance_history': performance_history,
                'recent_performance': recent_performance,
                'learning_velocity': learning_velocity,
                'consistency': consistency,
                'engagement': engagement,
                'total_submissions': len(submissions),
                'start_date': submissions[0].get('timestamp') if submissions else datetime.utcnow(),
                'last_activity': submissions[-1].get('timestamp') if submissions else datetime.utcnow()
            }
            
        except Exception as e:
            print(f"Error collecting user data: {e}")
            return {}
    
    def _calculate_current_skill_level(self, user_data: Dict[str, Any]) -> float:
        """Calculate current skill level"""
        if not user_data.get('recent_performance'):
            return 0.0
        
        recent_accuracies = [p['accuracy'] for p in user_data['recent_performance']]
        return statistics.mean(recent_accuracies) if recent_accuracies else 0.0
    
    def _predict_milestones(self, user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Predict learning milestones"""
        current_level = self._calculate_current_skill_level(user_data)
        velocity = user_data.get('learning_velocity', 0.01)
        
        milestones = []
        target_levels = [0.3, 0.5, 0.7, 0.8, 0.9]
        
        for target in target_levels:
            if target > current_level:
                days_to_reach = max(7, int((target - current_level) / velocity * 30))
                milestones.append({
                    'level': target,
                    'description': f"{target:.0%} Mastery",
                    'estimated_date': datetime.utcnow() + timedelta(days=days_to_reach),
                    'confidence': 0.8 if days_to_reach <= 60 else 0.6
                })
        
        return milestones
    
    def _calculate_completion_probability(self, user_data: Dict[str, Any]) -> float:
        """Calculate probability of course completion"""
        if not user_data:
            return 0.5
        
        # Factors affecting completion probability
        consistency = user_data.get('consistency', 0.5)
        engagement = user_data.get('engagement', 0.5)
        current_performance = self._calculate_current_skill_level(user_data)
        
        # Weighted combination
        probability = (
            consistency * 0.4 +
            engagement * 0.3 +
            current_performance * 0.3
        )
        
        return max(0.1, min(0.95, probability))
    
    def _estimate_time_to_mastery(self, user_data: Dict[str, Any]) -> int:
        """Estimate days to achieve mastery (90% skill level)"""
        current_level = self._calculate_current_skill_level(user_data)
        velocity = user_data.get('learning_velocity', 0.01)
        
        if current_level >= 0.9:
            return 0
        
        if velocity <= 0:
            return 365  # Default to 1 year if no velocity
        
        remaining_progress = 0.9 - current_level
        days_needed = int(remaining_progress / velocity * 30)
        
        return min(365, max(7, days_needed))  # Between 1 week and 1 year
    
    def _determine_recommended_pace(self, user_data: Dict[str, Any]) -> str:
        """Determine recommended learning pace"""
        consistency = user_data.get('consistency', 0.5)
        engagement = user_data.get('engagement', 0.5)
        performance = self._calculate_current_skill_level(user_data)
        
        overall_score = (consistency + engagement + performance) / 3
        
        if overall_score > 0.7:
            return "accelerated"
        elif overall_score > 0.4:
            return "normal"
        else:
            return "relaxed"
    
    def _identify_risk_factors(self, user_data: Dict[str, Any]) -> List[str]:
        """Identify learning risk factors"""
        risks = []
        
        if user_data.get('consistency', 0.5) < 0.4:
            risks.append("Inconsistent study pattern")
        
        if user_data.get('engagement', 0.5) < 0.3:
            risks.append("Low engagement level")
        
        current_performance = self._calculate_current_skill_level(user_data)
        if current_performance < 0.3:
            risks.append("Struggling with fundamentals")
        
        if len(user_data.get('performance_history', [])) > 20:
            recent_trend = self._calculate_recent_trend(user_data['performance_history'])
            if recent_trend < -0.1:
                risks.append("Declining performance trend")
        
        return risks
    
    def _identify_success_indicators(self, user_data: Dict[str, Any]) -> List[str]:
        """Identify success indicators"""
        indicators = []
        
        if user_data.get('consistency', 0.5) > 0.7:
            indicators.append("High consistency in learning")
        
        if user_data.get('engagement', 0.5) > 0.8:
            indicators.append("Strong engagement with material")
        
        current_performance = self._calculate_current_skill_level(user_data)
        if current_performance > 0.7:
            indicators.append("Strong foundational knowledge")
        
        if user_data.get('learning_velocity', 0) > 0.02:
            indicators.append("Fast learning velocity")
        
        return indicators
    
    def _calculate_confidence_interval(self, prediction: float, user_data: Dict[str, Any]) -> Tuple[float, float]:
        """Calculate confidence interval for prediction"""
        # Calculate prediction uncertainty based on data variability
        performance_history = user_data.get('performance_history', [])
        
        if len(performance_history) < 3:
            uncertainty = 0.2
        else:
            accuracies = [p['accuracy'] for p in performance_history]
            uncertainty = statistics.stdev(accuracies) if len(accuracies) > 1 else 0.2
        
        # 85% confidence interval (approximately 1.44 standard deviations)
        margin = uncertainty * 1.44
        
        lower_bound = max(0.0, prediction - margin)
        upper_bound = min(1.0, prediction + margin)
        
        return (lower_bound, upper_bound)
    
    def _identify_prediction_factors(self, user_data: Dict[str, Any]) -> List[str]:
        """Identify factors considered in prediction"""
        factors = ["Recent performance trend"]
        
        if len(user_data.get('performance_history', [])) > 10:
            factors.append("Historical learning pattern")
        
        if user_data.get('consistency', 0) > 0:
            factors.append("Learning consistency")
        
        if user_data.get('engagement', 0) > 0:
            factors.append("Engagement level")
        
        factors.append("Individual learning velocity")
        
        return factors
    
    def _calculate_model_accuracy(self, user_id: str, model_type: PredictionModel) -> float:
        """Calculate historical accuracy of the model"""
        # This would involve backtesting the model on historical data
        # For now, return a reasonable estimate based on model type
        
        accuracy_estimates = {
            PredictionModel.LINEAR_REGRESSION: 0.75,
            PredictionModel.EXPONENTIAL_SMOOTHING: 0.80,
            PredictionModel.BAYESIAN_LEARNING: 0.85,
            PredictionModel.MARKOV_CHAIN: 0.70,
            PredictionModel.ENSEMBLE: 0.88
        }
        
        return accuracy_estimates.get(model_type, 0.75)
    
    # Additional helper methods
    def _calculate_learning_velocity(self, performance_history: List[Dict]) -> float:
        """Calculate learning velocity"""
        if len(performance_history) < 5:
            return 0.01
        
        # Calculate improvement rate over time
        first_half = performance_history[:len(performance_history)//2]
        second_half = performance_history[len(performance_history)//2:]
        
        first_avg = statistics.mean([p['accuracy'] for p in first_half])
        second_avg = statistics.mean([p['accuracy'] for p in second_half])
        
        improvement = second_avg - first_avg
        time_span = len(performance_history) / 30  # Convert to months
        
        velocity = improvement / time_span if time_span > 0 else 0
        return max(0, velocity)
    
    def _calculate_consistency(self, performance_history: List[Dict]) -> float:
        """Calculate learning consistency"""
        if len(performance_history) < 5:
            return 0.5
        
        accuracies = [p['accuracy'] for p in performance_history]
        if len(accuracies) < 2:
            return 0.5
        
        variance = statistics.variance(accuracies)
        consistency = max(0, 1 - variance * 2)  # Invert variance to get consistency
        
        return min(1.0, consistency)
    
    def _calculate_engagement(self, user_id: str) -> float:
        """Calculate user engagement score"""
        # Simplified engagement calculation
        # In practice, this would consider login frequency, session duration, etc.
        return 0.7  # Placeholder
    
    def _calculate_recent_trend(self, performance_history: List[Dict]) -> float:
        """Calculate recent performance trend"""
        if len(performance_history) < 6:
            return 0.0
        
        recent_data = performance_history[-6:]
        first_half = recent_data[:3]
        second_half = recent_data[3:]
        
        first_avg = statistics.mean([p['accuracy'] for p in first_half])
        second_avg = statistics.mean([p['accuracy'] for p in second_half])
        
        return second_avg - first_avg
    
    # Default/fallback methods
    def _get_default_prediction(self, user_id: str, time_horizon: int) -> PredictionResult:
        """Get default prediction for users with insufficient data"""
        return PredictionResult(
            model_type="default",
            prediction_value=0.5,
            confidence_interval=(0.3, 0.7),
            confidence_level=0.5,
            time_horizon=time_horizon,
            factors_considered=["Insufficient data"],
            model_accuracy=0.6,
            last_updated=datetime.utcnow()
        )
    
    def _get_default_trajectory(self, user_id: str) -> LearningTrajectory:
        """Get default trajectory for new users"""
        return LearningTrajectory(
            user_id=user_id,
            current_skill_level=0.0,
            predicted_milestones=[],
            completion_probability=0.5,
            time_to_mastery=180,  # 6 months
            recommended_pace="normal",
            risk_factors=["New learner - limited data"],
            success_indicators=[]
        )
    
    def _get_default_forecast(self, metric: str) -> PerformanceForecast:
        """Get default forecast for metrics"""
        return PerformanceForecast(
            metric_name=metric,
            current_value=0.5,
            predictions={"7_days": 0.5, "30_days": 0.55, "90_days": 0.6},
            trend_analysis={"direction": "stable", "strength": 0.0},
            volatility_score=0.3,
            prediction_accuracy=0.6
        )
    
    # Placeholder methods for complex functionality
    def _collect_concept_data(self, user_id: str, concept: str) -> Dict[str, Any]:
        """Collect concept-specific data"""
        return {}
    
    def _predict_concept_timeline(self, concept_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict concept mastery timeline"""
        return {"date": datetime.utcnow() + timedelta(days=30), "confidence": 0.7}
    
    def _calculate_required_effort(self, concept_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate required effort for concept mastery"""
        return {"hours": 20, "problems": 50}
    
    def _predict_difficulty_curve(self, concept_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Predict difficulty progression curve"""
        return []
    
    def _calculate_concept_success_probability(self, concept_data: Dict[str, Any]) -> float:
        """Calculate concept mastery success probability"""
        return 0.8
    
    def _analyze_learning_patterns(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze learning patterns for schedule optimization"""
        return {}
    
    def _predict_optimal_study_times(self, patterns: Dict[str, Any]) -> List[str]:
        """Predict optimal study times"""
        return ["09:00-11:00", "14:00-16:00"]
    
    def _predict_optimal_session_length(self, patterns: Dict[str, Any]) -> int:
        """Predict optimal session length in minutes"""
        return 45
    
    def _predict_optimal_breaks(self, patterns: Dict[str, Any]) -> Dict[str, int]:
        """Predict optimal break intervals"""
        return {"short_break": 5, "long_break": 15}
    
    def _predict_weekly_distribution(self, patterns: Dict[str, Any]) -> Dict[str, float]:
        """Predict optimal weekly study distribution"""
        return {
            "monday": 0.15, "tuesday": 0.15, "wednesday": 0.15,
            "thursday": 0.15, "friday": 0.15, "saturday": 0.15, "sunday": 0.10
        }
    
    def _calculate_efficiency_gain(self, user_data: Dict[str, Any]) -> float:
        """Calculate expected efficiency gain from optimized schedule"""
        return 0.2  # 20% improvement
    
    def _model_intervention_effect(self, user_data: Dict[str, Any], intervention: Dict[str, Any]) -> Dict[str, Any]:
        """Model the effect of an intervention"""
        return {"improvement_factor": 1.2}
    
    def _apply_intervention_effect(self, baseline: PredictionResult, effect: Dict[str, Any]) -> Dict[str, Any]:
        """Apply intervention effect to baseline prediction"""
        improvement = effect.get("improvement_factor", 1.0)
        return {
            "progress_rate": baseline.prediction_value * improvement,
            "time_to_mastery": int(180 / improvement),
            "success_probability": min(0.95, baseline.confidence_level * improvement)
        }
    
    def _calculate_improvement_metrics(self, baseline: PredictionResult, modified: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate improvement metrics"""
        return {
            "improvement_percentage": ((modified["progress_rate"] - baseline.prediction_value) / baseline.prediction_value) * 100
        }
    
    def _calculate_intervention_roi(self, improvement: Dict[str, Any], intervention: Dict[str, Any]) -> float:
        """Calculate return on investment for intervention"""
        return 2.5  # Placeholder ROI
    
    def _forecast_single_metric(self, user_data: Dict[str, Any], metric: str) -> PerformanceForecast:
        """Forecast a single performance metric"""
        current_value = 0.6  # Placeholder
        
        # Simple forecasting logic
        predictions = {
            "7_days": current_value + 0.02,
            "30_days": current_value + 0.05,
            "90_days": current_value + 0.1
        }
        
        return PerformanceForecast(
            metric_name=metric,
            current_value=current_value,
            predictions=predictions,
            trend_analysis={"direction": "improving", "strength": 0.3},
            volatility_score=0.2,
            prediction_accuracy=0.8
        )

# Create global prediction models instance
prediction_models = PredictionModels()