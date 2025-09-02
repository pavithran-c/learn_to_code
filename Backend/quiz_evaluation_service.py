"""
Quiz Evaluation Service - Unified evaluation system for all quiz types
Applies adaptive learning and knowledge tracking to different quiz formats
"""

from dataclasses import dataclass, asdict
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

@dataclass
class QuizAttempt:
    """Unified quiz attempt record"""
    user_id: str
    quiz_type: str  # 'competitive', 'programming', 'core_subjects', 'coding_problems'
    quiz_id: str
    question_id: str
    question_text: str
    subject_area: str  # 'aptitude', 'programming', 'data_structures', 'algorithms', etc.
    difficulty: str  # 'easy', 'medium', 'hard'
    user_answer: str
    correct_answer: str
    is_correct: bool
    time_taken_seconds: int
    hints_used: int
    timestamp: str
    additional_data: Dict = None  # For quiz-specific data
    
    def __post_init__(self):
        if self.additional_data is None:
            self.additional_data = {}

@dataclass
class QuizSessionEvaluation:
    """Complete quiz session evaluation"""
    user_id: str
    session_id: str
    quiz_type: str
    subject_area: str
    total_questions: int
    correct_answers: int
    total_time_seconds: int
    difficulty_breakdown: Dict[str, Dict[str, int]]  # {'easy': {'correct': 2, 'total': 3}, ...}
    concept_performance: Dict[str, Dict[str, int]]  # Performance by concept
    accuracy_percentage: float
    time_per_question_avg: float
    strength_areas: List[str]
    weakness_areas: List[str]
    recommended_focus: List[str]
    adaptive_metrics: Dict  # IRT theta, concept mastery updates
    session_start: str
    session_end: str
    attempts: List[QuizAttempt]

class QuizEvaluationService:
    """Service for evaluating quiz performance and updating knowledge models"""
    
    def __init__(self, adaptive_engine, db_service):
        self.adaptive_engine = adaptive_engine
        self.db_service = db_service
        
        # Subject to concept mapping for knowledge tracking
        self.subject_concept_mapping = {
            'data_structures': ['arrays', 'lists', 'stacks', 'queues', 'trees', 'graphs', 'hash_tables'],
            'algorithms': ['sorting', 'searching', 'recursion', 'dynamic_programming', 'greedy', 'graph_algorithms'],
            'programming': ['loops', 'conditions', 'functions', 'variables', 'oop', 'error_handling'],
            'database_management': ['sql', 'normalization', 'indexing', 'transactions', 'query_optimization'],
            'operating_systems': ['processes', 'threads', 'memory_management', 'file_systems', 'scheduling'],
            'computer_networks': ['protocols', 'osi_model', 'routing', 'security', 'performance'],
            'software_engineering': ['design_patterns', 'testing', 'version_control', 'project_management'],
            'aptitude': ['logical_reasoning', 'quantitative_analysis', 'verbal_reasoning', 'pattern_recognition']
        }
        
        # Difficulty to IRT difficulty mapping
        self.difficulty_mapping = {
            'easy': -0.5,
            'medium': 0.0,
            'hard': 0.5
        }
    
    def evaluate_quiz_attempt(self, attempt: QuizAttempt) -> Dict:
        """Evaluate a single quiz attempt and update knowledge models"""
        
        # Map subject to concepts
        concepts = self.subject_concept_mapping.get(attempt.subject_area.lower(), [attempt.subject_area.lower()])
        
        # Create or update item in adaptive engine
        item_id = f"{attempt.quiz_type}_{attempt.question_id}"
        difficulty_value = self.difficulty_mapping.get(attempt.difficulty, 0.0)
        
        item = self.adaptive_engine.get_or_create_item(item_id, concepts)
        item.difficulty = difficulty_value
        
        # Create adaptive learning attempt record
        from adaptive_engine import AttemptRecord
        adaptive_attempt = AttemptRecord(
            user_id=attempt.user_id,
            item_id=item_id,
            score=1.0 if attempt.is_correct else 0.0,
            binary_score=1 if attempt.is_correct else 0,
            time_taken=attempt.time_taken_seconds * 1000,  # Convert to milliseconds
            timestamp=attempt.timestamp,
            hints_used=attempt.hints_used,
            code_quality_signals={'quiz_type': attempt.quiz_type, 'subject': attempt.subject_area}
        )
        
        # Process attempt through adaptive engine
        adaptive_result = self.adaptive_engine.process_attempt(adaptive_attempt)
        
        return {
            'attempt_id': f"{attempt.user_id}_{attempt.timestamp}",
            'adaptive_result': adaptive_result,
            'concepts_updated': concepts,
            'item_difficulty': difficulty_value
        }
    
    def evaluate_quiz_session(self, attempts: List[QuizAttempt]) -> QuizSessionEvaluation:
        """Evaluate complete quiz session and generate comprehensive analysis"""
        
        if not attempts:
            raise ValueError("No attempts provided for evaluation")
        
        # Basic session info
        first_attempt = attempts[0]
        user_id = first_attempt.user_id
        quiz_type = first_attempt.quiz_type
        subject_area = first_attempt.subject_area
        session_id = f"{user_id}_{first_attempt.timestamp[:19]}"  # Date + hour
        
        # Calculate basic metrics
        total_questions = len(attempts)
        correct_answers = sum(1 for a in attempts if a.is_correct)
        total_time = sum(a.time_taken_seconds for a in attempts)
        accuracy_percentage = (correct_answers / total_questions) * 100
        time_per_question = total_time / total_questions if total_questions > 0 else 0
        
        # Difficulty breakdown
        difficulty_breakdown = {}
        for difficulty in ['easy', 'medium', 'hard']:
            difficulty_attempts = [a for a in attempts if a.difficulty == difficulty]
            if difficulty_attempts:
                difficulty_breakdown[difficulty] = {
                    'correct': sum(1 for a in difficulty_attempts if a.is_correct),
                    'total': len(difficulty_attempts),
                    'accuracy': (sum(1 for a in difficulty_attempts if a.is_correct) / len(difficulty_attempts)) * 100
                }
        
        # Concept performance analysis
        concept_performance = {}
        concepts = self.subject_concept_mapping.get(subject_area.lower(), [subject_area.lower()])
        
        for concept in concepts:
            # For now, map all attempts to relevant concepts
            # In a more sophisticated system, each question would be tagged with specific concepts
            concept_performance[concept] = {
                'correct': correct_answers,
                'total': total_questions,
                'accuracy': accuracy_percentage
            }
        
        # Process each attempt through adaptive engine and collect results
        adaptive_metrics = {'theta_updates': [], 'concept_mastery_updates': {}}
        
        for attempt in attempts:
            result = self.evaluate_quiz_attempt(attempt)
            adaptive_metrics['theta_updates'].append(result['adaptive_result']['user_theta'])
            
            # Collect concept mastery updates
            for concept, mastery in result['adaptive_result']['concept_mastery'].items():
                if concept not in adaptive_metrics['concept_mastery_updates']:
                    adaptive_metrics['concept_mastery_updates'][concept] = []
                adaptive_metrics['concept_mastery_updates'][concept].append(mastery)
        
        # Calculate final adaptive metrics
        final_theta = adaptive_metrics['theta_updates'][-1] if adaptive_metrics['theta_updates'] else 0.0
        final_concept_mastery = {}
        for concept, masteries in adaptive_metrics['concept_mastery_updates'].items():
            final_concept_mastery[concept] = masteries[-1] if masteries else 0.0
        
        # Identify strengths and weaknesses
        strength_threshold = 0.8
        weakness_threshold = 0.4
        
        strength_areas = [concept for concept, mastery in final_concept_mastery.items() if mastery > strength_threshold]
        weakness_areas = [concept for concept, mastery in final_concept_mastery.items() if mastery < weakness_threshold]
        
        # Generate recommendations
        recommended_focus = weakness_areas[:3]  # Top 3 weak areas
        
        if accuracy_percentage < 60:
            recommended_focus.extend(['basic_concepts_review', 'practice_fundamentals'])
        elif accuracy_percentage < 80:
            recommended_focus.extend(['intermediate_problems', 'concept_application'])
        else:
            recommended_focus.extend(['advanced_topics', 'optimization_techniques'])
        
        # Create session evaluation
        session_evaluation = QuizSessionEvaluation(
            user_id=user_id,
            session_id=session_id,
            quiz_type=quiz_type,
            subject_area=subject_area,
            total_questions=total_questions,
            correct_answers=correct_answers,
            total_time_seconds=total_time,
            difficulty_breakdown=difficulty_breakdown,
            concept_performance=concept_performance,
            accuracy_percentage=round(accuracy_percentage, 1),
            time_per_question_avg=round(time_per_question, 1),
            strength_areas=strength_areas,
            weakness_areas=weakness_areas,
            recommended_focus=recommended_focus,
            adaptive_metrics={
                'final_theta': round(final_theta, 3),
                'final_concept_mastery': {k: round(v, 3) for k, v in final_concept_mastery.items()},
                'theta_progression': [round(t, 3) for t in adaptive_metrics['theta_updates']],
                'elo_rating': adaptive_metrics['theta_updates'][-1] if adaptive_metrics['theta_updates'] else 1500
            },
            session_start=attempts[0].timestamp,
            session_end=attempts[-1].timestamp,
            attempts=attempts
        )
        
        return session_evaluation
    
    def save_quiz_evaluation(self, session_evaluation: QuizSessionEvaluation) -> str:
        """Save quiz evaluation to database"""
        try:
            # Convert to dict for database storage
            evaluation_doc = asdict(session_evaluation)
            evaluation_doc['evaluation_type'] = 'quiz_session'
            evaluation_doc['submission_time'] = datetime.now().isoformat()
            
            # Save to database
            evaluation_id = self.db_service.save_evaluation(evaluation_doc)
            
            return evaluation_id
            
        except Exception as e:
            print(f"Error saving quiz evaluation: {e}")
            raise
    
    def get_user_quiz_analytics(self, user_id: str, quiz_type: str = None) -> Dict:
        """Get analytics for user's quiz performance"""
        try:
            # Get user evaluations from database
            evaluations = self.db_service.get_user_evaluations(user_id, limit=100)
            
            # Filter quiz evaluations
            quiz_evaluations = [
                eval_doc for eval_doc in evaluations 
                if eval_doc.get('evaluation_type') == 'quiz_session' and
                (not quiz_type or eval_doc.get('quiz_type') == quiz_type)
            ]
            
            if not quiz_evaluations:
                return {
                    'user_id': user_id,
                    'total_sessions': 0,
                    'total_questions': 0,
                    'overall_accuracy': 0,
                    'avg_session_time': 0,
                    'subject_performance': {},
                    'learning_progression': []
                }
            
            # Calculate analytics
            total_sessions = len(quiz_evaluations)
            total_questions = sum(eval_doc.get('total_questions', 0) for eval_doc in quiz_evaluations)
            total_correct = sum(eval_doc.get('correct_answers', 0) for eval_doc in quiz_evaluations)
            overall_accuracy = (total_correct / total_questions) * 100 if total_questions > 0 else 0
            
            total_time = sum(eval_doc.get('total_time_seconds', 0) for eval_doc in quiz_evaluations)
            avg_session_time = total_time / total_sessions if total_sessions > 0 else 0
            
            # Subject performance breakdown
            subject_performance = {}
            for eval_doc in quiz_evaluations:
                subject = eval_doc.get('subject_area', 'unknown')
                if subject not in subject_performance:
                    subject_performance[subject] = {
                        'sessions': 0,
                        'total_questions': 0,
                        'correct_answers': 0,
                        'accuracy': 0
                    }
                
                subject_performance[subject]['sessions'] += 1
                subject_performance[subject]['total_questions'] += eval_doc.get('total_questions', 0)
                subject_performance[subject]['correct_answers'] += eval_doc.get('correct_answers', 0)
                
                if subject_performance[subject]['total_questions'] > 0:
                    subject_performance[subject]['accuracy'] = (
                        subject_performance[subject]['correct_answers'] / 
                        subject_performance[subject]['total_questions']
                    ) * 100
            
            # Learning progression (chronological)
            learning_progression = sorted(
                [
                    {
                        'date': eval_doc.get('session_start', '')[:10],
                        'accuracy': eval_doc.get('accuracy_percentage', 0),
                        'theta': eval_doc.get('adaptive_metrics', {}).get('final_theta', 0),
                        'subject_area': eval_doc.get('subject_area', 'unknown')
                    }
                    for eval_doc in quiz_evaluations
                ],
                key=lambda x: x['date']
            )
            
            return {
                'user_id': user_id,
                'total_sessions': total_sessions,
                'total_questions': total_questions,
                'overall_accuracy': round(overall_accuracy, 1),
                'avg_session_time': round(avg_session_time, 1),
                'subject_performance': {k: {**v, 'accuracy': round(v['accuracy'], 1)} for k, v in subject_performance.items()},
                'learning_progression': learning_progression,
                'recent_performance': learning_progression[-5:] if learning_progression else []
            }
            
        except Exception as e:
            print(f"Error getting quiz analytics: {e}")
            return {
                'user_id': user_id,
                'total_sessions': 0,
                'total_questions': 0,
                'overall_accuracy': 0,
                'error': str(e)
            }
