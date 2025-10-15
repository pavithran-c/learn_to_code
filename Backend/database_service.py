"""
MongoDB Database Service for Learning Platform
Handles user evaluations, problem solving status, and progress tracking
"""

import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

class DatabaseService:
    def __init__(self):
        self.client = None
        self.db = None
        self.connect()
    
    def connect(self):
        """Connect to MongoDB Atlas"""
        try:
            mongodb_uri = os.getenv('MONGODB_URI')
            if not mongodb_uri:
                raise ValueError("MONGODB_URI environment variable not set")
            
            self.client = MongoClient(mongodb_uri)
            # Test connection
            self.client.admin.command('ping')
            
            database_name = os.getenv('MONGODB_DATABASE', 'learn_to_code')
            self.db = self.client[database_name]
            
            # Create indexes for better performance
            self.create_indexes()
            print("Successfully connected to MongoDB Atlas")
            
        except ConnectionFailure as e:
            print(f"Failed to connect to MongoDB: {e}")
            raise
        except Exception as e:
            print(f"Database connection error: {e}")
            raise
    
    def create_indexes(self):
        """Create database indexes for better query performance"""
        try:
            # Evaluations collection indexes
            self.db.evaluations.create_index([("user_id", 1), ("problem_id", 1), ("timestamp", -1)])
            self.db.evaluations.create_index([("user_id", 1), ("timestamp", -1)])
            self.db.evaluations.create_index([("problem_id", 1)])
            
            # User progress collection indexes
            self.db.user_progress.create_index([("user_id", 1)], unique=True)
            self.db.user_progress.create_index([("user_id", 1), ("solved_problems.problem_id", 1)])
            
            # User authentication indexes
            self.db.users.create_index([("email", 1)], unique=True)
            self.db.users.create_index([("email", 1), ("is_active", 1)])
            self.db.users.create_index([("created_at", -1)])
            
            # Refresh tokens indexes
            self.db.refresh_tokens.create_index([("user_id", 1), ("is_active", 1)])
            self.db.refresh_tokens.create_index([("token", 1)])
            self.db.refresh_tokens.create_index([("expires_at", 1)])
            
            # Code submissions indexes
            self.db.code_submissions.create_index([("user_id", 1), ("problem_id", 1), ("timestamp", -1)])
            self.db.code_submissions.create_index([("user_id", 1), ("timestamp", -1)])
            
            # Skill progress indexes
            self.db.skill_progress.create_index([("user_id", 1)], unique=True)
            self.db.skill_progress.create_index([("user_id", 1), ("skill_name", 1)])
            
            print("Database indexes created successfully")
        except Exception as e:
            print(f"Error creating indexes: {e}")
    
    def save_evaluation(self, evaluation_data):
        """
        Save evaluation result to database
        
        Args:
            evaluation_data (dict): Complete evaluation result data
        
        Returns:
            str: MongoDB ObjectId of saved document
        """
        try:
            # Add timestamp if not present
            if 'timestamp' not in evaluation_data:
                evaluation_data['timestamp'] = datetime.now(timezone.utc)
            
            # Insert evaluation
            result = self.db.evaluations.insert_one(evaluation_data)
            
            # Update user progress
            self.update_user_progress(
                user_id=evaluation_data['user_id'],
                problem_id=evaluation_data['problem_id'],
                solved=evaluation_data.get('all_passed', False),
                score=evaluation_data.get('scores', {}).get('overall', 0),
                attempt_data=evaluation_data
            )
            
            print(f"Evaluation saved successfully with ID: {result.inserted_id}")
            return str(result.inserted_id)
            
        except Exception as e:
            print(f"Error saving evaluation: {e}")
            raise
    
    def update_user_progress(self, user_id, problem_id, solved, score, attempt_data):
        """
        Update user's problem-solving progress
        
        Args:
            user_id (str): User identifier
            problem_id (str): Problem identifier
            solved (bool): Whether problem was solved successfully
            score (float): Overall score achieved
            attempt_data (dict): Full attempt data
        """
        try:
            # Check if user progress document exists
            user_progress = self.db.user_progress.find_one({"user_id": user_id})
            
            if not user_progress:
                # Create new user progress document
                user_progress = {
                    "user_id": user_id,
                    "solved_problems": [],
                    "attempted_problems": [],
                    "total_attempts": 0,
                    "total_solved": 0,
                    "total_score": 0,
                    "average_score": 0,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
            
            # Update attempt count
            user_progress["total_attempts"] = user_progress.get("total_attempts", 0) + 1
            user_progress["updated_at"] = datetime.now(timezone.utc)
            
            # Check if problem was previously solved
            solved_problems = user_progress.get("solved_problems", [])
            attempted_problems = user_progress.get("attempted_problems", [])
            
            # Update solved problems
            existing_solved = next((p for p in solved_problems if p["problem_id"] == problem_id), None)
            
            if solved and not existing_solved:
                # First time solving this problem
                solved_problems.append({
                    "problem_id": problem_id,
                    "solved_at": datetime.now(timezone.utc),
                    "best_score": score,
                    "attempts_to_solve": len([a for a in attempted_problems if a["problem_id"] == problem_id]) + 1
                })
                user_progress["total_solved"] = len(solved_problems)
                
            elif solved and existing_solved and score > existing_solved["best_score"]:
                # Update best score if current score is better
                existing_solved["best_score"] = score
                existing_solved["solved_at"] = datetime.now(timezone.utc)
            
            # Update attempted problems
            existing_attempt = next((a for a in attempted_problems if a["problem_id"] == problem_id), None)
            
            if existing_attempt:
                existing_attempt["attempts"] += 1
                existing_attempt["last_attempt"] = datetime.now(timezone.utc)
                existing_attempt["best_score"] = max(existing_attempt["best_score"], score)
                existing_attempt["last_solved"] = solved
            else:
                attempted_problems.append({
                    "problem_id": problem_id,
                    "attempts": 1,
                    "first_attempt": datetime.now(timezone.utc),
                    "last_attempt": datetime.now(timezone.utc),
                    "best_score": score,
                    "last_solved": solved
                })
            
            # Update aggregated statistics
            user_progress["solved_problems"] = solved_problems
            user_progress["attempted_problems"] = attempted_problems
            
            # Calculate average score
            if user_progress["total_attempts"] > 0:
                # Get recent scores for average calculation
                recent_evaluations = list(self.db.evaluations.find(
                    {"user_id": user_id},
                    {"scores.overall": 1}
                ).sort("timestamp", -1).limit(20))
                
                if recent_evaluations:
                    total_recent_score = sum(
                        eval_data.get("scores", {}).get("overall", 0) 
                        for eval_data in recent_evaluations
                    )
                    user_progress["average_score"] = total_recent_score / len(recent_evaluations)
            
            # Upsert user progress
            self.db.user_progress.replace_one(
                {"user_id": user_id},
                user_progress,
                upsert=True
            )
            
            print(f"User progress updated for {user_id}")
            
        except Exception as e:
            print(f"Error updating user progress: {e}")
            raise
    
    def get_user_evaluations(self, user_id, limit=50, skip=0):
        """
        Get user's evaluation history
        
        Args:
            user_id (str): User identifier
            limit (int): Maximum number of evaluations to return
            skip (int): Number of evaluations to skip (for pagination)
        
        Returns:
            list: List of evaluation documents
        """
        try:
            evaluations = list(
                self.db.evaluations.find({"user_id": user_id})
                .sort("timestamp", -1)
                .skip(skip)
                .limit(limit)
            )
            
            # Convert ObjectId to string for JSON serialization
            for evaluation in evaluations:
                evaluation["_id"] = str(evaluation["_id"])
                if isinstance(evaluation.get("timestamp"), datetime):
                    evaluation["timestamp"] = evaluation["timestamp"].isoformat()
            
            return evaluations
            
        except Exception as e:
            print(f"Error fetching user evaluations: {e}")
            return []
    
    def get_user_progress(self, user_id):
        """
        Get user's overall progress statistics
        
        Args:
            user_id (str): User identifier
        
        Returns:
            dict: User progress data
        """
        try:
            progress = self.db.user_progress.find_one({"user_id": user_id})
            
            if progress:
                progress["_id"] = str(progress["_id"])
                # Convert datetime objects to ISO strings
                for key, value in progress.items():
                    if isinstance(value, datetime):
                        progress[key] = value.isoformat()
                    elif isinstance(value, list):
                        for item in value:
                            if isinstance(item, dict):
                                for sub_key, sub_value in item.items():
                                    if isinstance(sub_value, datetime):
                                        item[sub_key] = sub_value.isoformat()
            
            return progress
            
        except Exception as e:
            print(f"Error fetching user progress: {e}")
            return None
    
    def get_problem_statistics(self, problem_id):
        """
        Get statistics for a specific problem
        
        Args:
            problem_id (str): Problem identifier
        
        Returns:
            dict: Problem statistics
        """
        try:
            # Get all attempts for this problem
            attempts = list(self.db.evaluations.find({"problem_id": problem_id}))
            
            if not attempts:
                return {
                    "problem_id": problem_id,
                    "total_attempts": 0,
                    "total_users": 0,
                    "success_rate": 0,
                    "average_score": 0,
                    "average_attempts_to_solve": 0
                }
            
            total_attempts = len(attempts)
            unique_users = len(set(attempt["user_id"] for attempt in attempts))
            successful_attempts = sum(1 for attempt in attempts if attempt.get("all_passed", False))
            
            total_score = sum(
                attempt.get("scores", {}).get("overall", 0) 
                for attempt in attempts
            )
            average_score = total_score / total_attempts if total_attempts > 0 else 0
            
            success_rate = (successful_attempts / total_attempts * 100) if total_attempts > 0 else 0
            
            return {
                "problem_id": problem_id,
                "total_attempts": total_attempts,
                "total_users": unique_users,
                "successful_attempts": successful_attempts,
                "success_rate": round(success_rate, 1),
                "average_score": round(average_score, 1),
                "difficulty_rating": "Easy" if success_rate > 70 else "Medium" if success_rate > 40 else "Hard"
            }
            
        except Exception as e:
            print(f"Error fetching problem statistics: {e}")
            return None
    
    def get_leaderboard(self, limit=10):
        """
        Get top users based on problems solved and average scores
        
        Args:
            limit (int): Number of top users to return
        
        Returns:
            list: Leaderboard data
        """
        try:
            # Aggregate user rankings
            pipeline = [
                {
                    "$match": {"total_solved": {"$gt": 0}}
                },
                {
                    "$sort": {
                        "total_solved": -1,
                        "average_score": -1
                    }
                },
                {
                    "$limit": limit
                },
                {
                    "$project": {
                        "user_id": 1,
                        "total_solved": 1,
                        "total_attempts": 1,
                        "average_score": 1,
                        "success_rate": {
                            "$cond": {
                                "if": {"$gt": ["$total_attempts", 0]},
                                "then": {"$multiply": [{"$divide": ["$total_solved", "$total_attempts"]}, 100]},
                                "else": 0
                            }
                        }
                    }
                }
            ]
            
            leaderboard = list(self.db.user_progress.aggregate(pipeline))
            
            # Convert ObjectId to string
            for entry in leaderboard:
                entry["_id"] = str(entry["_id"])
                entry["success_rate"] = round(entry["success_rate"], 1)
                entry["average_score"] = round(entry["average_score"], 1)
            
            return leaderboard
            
        except Exception as e:
            print(f"Error fetching leaderboard: {e}")
            return []
    
    def save_code_submission(self, user_id, problem_id, code, language, execution_result=None):
        """Save user's code submission"""
        try:
            submission_doc = {
                'user_id': user_id,
                'problem_id': problem_id,
                'code': code,
                'language': language,
                'execution_result': execution_result,
                'timestamp': datetime.now(timezone.utc),
                'submission_number': self._get_next_submission_number(user_id, problem_id)
            }
            
            result = self.db.code_submissions.insert_one(submission_doc)
            return str(result.inserted_id)
            
        except Exception as e:
            print(f"Error saving code submission: {e}")
            return None
    
    def get_user_code_submissions(self, user_id, problem_id=None, limit=50):
        """Get user's code submission history"""
        try:
            query = {'user_id': user_id}
            if problem_id:
                query['problem_id'] = problem_id
            
            submissions = list(
                self.db.code_submissions.find(query)
                .sort('timestamp', -1)
                .limit(limit)
            )
            
            # Convert ObjectId to string
            for submission in submissions:
                submission['_id'] = str(submission['_id'])
            
            return submissions
            
        except Exception as e:
            print(f"Error fetching code submissions: {e}")
            return []
    
    def update_user_skill_progress(self, user_id, skill_name, performance_data):
        """Update user's skill-specific progress"""
        try:
            # Get current skill progress
            skill_progress = self.db.skill_progress.find_one({'user_id': user_id})
            
            if not skill_progress:
                skill_progress = {
                    'user_id': user_id,
                    'skills': {},
                    'created_at': datetime.now(timezone.utc)
                }
            
            # Update specific skill
            if skill_name not in skill_progress['skills']:
                skill_progress['skills'][skill_name] = {
                    'level': 0,
                    'problems_solved': 0,
                    'total_attempts': 0,
                    'average_score': 0.0,
                    'progress_history': []
                }
            
            skill_data = skill_progress['skills'][skill_name]
            skill_data['total_attempts'] += 1
            
            if performance_data.get('solved', False):
                skill_data['problems_solved'] += 1
            
            # Update average score
            current_score = performance_data.get('score', 0)
            if skill_data['total_attempts'] == 1:
                skill_data['average_score'] = current_score
            else:
                skill_data['average_score'] = (
                    (skill_data['average_score'] * (skill_data['total_attempts'] - 1) + current_score) /
                    skill_data['total_attempts']
                )
            
            # Update skill level based on performance
            skill_data['level'] = self._calculate_skill_level(
                skill_data['problems_solved'],
                skill_data['average_score']
            )
            
            # Add to progress history
            skill_data['progress_history'].append({
                'timestamp': datetime.now(timezone.utc),
                'score': current_score,
                'solved': performance_data.get('solved', False)
            })
            
            # Keep only last 100 history entries
            if len(skill_data['progress_history']) > 100:
                skill_data['progress_history'] = skill_data['progress_history'][-100:]
            
            skill_progress['updated_at'] = datetime.now(timezone.utc)
            
            # Upsert skill progress
            self.db.skill_progress.replace_one(
                {'user_id': user_id},
                skill_progress,
                upsert=True
            )
            
        except Exception as e:
            print(f"Error updating skill progress: {e}")
    
    def get_user_skill_analysis(self, user_id):
        """Get detailed skill analysis for user"""
        try:
            skill_progress = self.db.skill_progress.find_one({'user_id': user_id})
            
            if not skill_progress:
                return {
                    'overall_level': 0,
                    'skills': {},
                    'recommendations': [],
                    'weak_areas': [],
                    'strong_areas': []
                }
            
            skills = skill_progress.get('skills', {})
            
            # Calculate overall level
            if skills:
                overall_level = sum(skill['level'] for skill in skills.values()) / len(skills)
            else:
                overall_level = 0
            
            # Identify weak and strong areas
            weak_areas = [name for name, data in skills.items() if data['level'] < 3]
            strong_areas = [name for name, data in skills.items() if data['level'] >= 7]
            
            # Generate recommendations
            recommendations = self._generate_skill_recommendations(skills)
            
            return {
                'overall_level': round(overall_level, 2),
                'skills': skills,
                'recommendations': recommendations,
                'weak_areas': weak_areas,
                'strong_areas': strong_areas,
                'last_updated': skill_progress.get('updated_at')
            }
            
        except Exception as e:
            print(f"Error getting skill analysis: {e}")
            return None
    
    def get_learning_analytics(self, user_id, days=30):
        """Get comprehensive learning analytics for user"""
        try:
            # Get recent evaluations
            start_date = datetime.now(timezone.utc) - timedelta(days=days)
            evaluations = list(
                self.db.evaluations.find({
                    'user_id': user_id,
                    'timestamp': {'$gte': start_date}
                }).sort('timestamp', 1)
            )
            
            if not evaluations:
                return {
                    'total_attempts': 0,
                    'success_rate': 0,
                    'average_score': 0,
                    'learning_velocity': 0,
                    'consistency_score': 0,
                    'daily_activity': [],
                    'skill_distribution': {},
                    'difficulty_performance': {}
                }
            
            # Calculate metrics
            total_attempts = len(evaluations)
            successful_attempts = sum(1 for e in evaluations if e.get('all_passed', False))
            success_rate = (successful_attempts / total_attempts) * 100
            
            scores = [e.get('scores', {}).get('overall', 0) for e in evaluations]
            average_score = sum(scores) / len(scores) if scores else 0
            
            # Calculate learning velocity (improvement over time)
            if len(scores) >= 10:
                first_half = scores[:len(scores)//2]
                second_half = scores[len(scores)//2:]
                first_avg = sum(first_half) / len(first_half)
                second_avg = sum(second_half) / len(second_half)
                learning_velocity = second_avg - first_avg
            else:
                learning_velocity = 0
            
            # Calculate consistency (standard deviation of scores)
            if len(scores) > 1:
                mean_score = sum(scores) / len(scores)
                variance = sum((x - mean_score) ** 2 for x in scores) / len(scores)
                std_dev = variance ** 0.5
                consistency_score = max(0, 100 - (std_dev * 10))  # Higher is more consistent
            else:
                consistency_score = 100
            
            # Daily activity analysis
            daily_activity = self._analyze_daily_activity(evaluations, days)
            
            # Skill distribution
            skill_distribution = self._analyze_skill_distribution(user_id)
            
            # Difficulty performance
            difficulty_performance = self._analyze_difficulty_performance(evaluations)
            
            return {
                'total_attempts': total_attempts,
                'success_rate': round(success_rate, 2),
                'average_score': round(average_score, 2),
                'learning_velocity': round(learning_velocity, 2),
                'consistency_score': round(consistency_score, 2),
                'daily_activity': daily_activity,
                'skill_distribution': skill_distribution,
                'difficulty_performance': difficulty_performance
            }
            
        except Exception as e:
            print(f"Error getting learning analytics: {e}")
            return None
    
    def _get_next_submission_number(self, user_id, problem_id):
        """Get next submission number for user-problem combination"""
        count = self.db.code_submissions.count_documents({
            'user_id': user_id,
            'problem_id': problem_id
        })
        return count + 1
    
    def _calculate_skill_level(self, problems_solved, average_score):
        """Calculate skill level based on problems solved and average score"""
        # Basic formula: combine problems solved and score
        level = min(10, (problems_solved * 0.5) + (average_score / 10))
        return round(level, 1)
    
    def _generate_skill_recommendations(self, skills):
        """Generate skill improvement recommendations"""
        recommendations = []
        
        for skill_name, skill_data in skills.items():
            if skill_data['level'] < 3:
                recommendations.append({
                    'type': 'improvement',
                    'skill': skill_name,
                    'message': f"Focus on {skill_name} - current level {skill_data['level']}",
                    'priority': 'high'
                })
            elif skill_data['level'] < 6:
                recommendations.append({
                    'type': 'practice',
                    'skill': skill_name,
                    'message': f"Practice more {skill_name} problems to advance",
                    'priority': 'medium'
                })
        
        return recommendations
    
    def _analyze_daily_activity(self, evaluations, days):
        """Analyze daily activity patterns"""
        daily_counts = {}
        
        for evaluation in evaluations:
            date_str = evaluation['timestamp'].strftime('%Y-%m-%d')
            daily_counts[date_str] = daily_counts.get(date_str, 0) + 1
        
        # Fill in missing days with 0
        activity = []
        for i in range(days):
            date = datetime.now(timezone.utc) - timedelta(days=i)
            date_str = date.strftime('%Y-%m-%d')
            activity.append({
                'date': date_str,
                'count': daily_counts.get(date_str, 0)
            })
        
        return list(reversed(activity))
    
    def _analyze_skill_distribution(self, user_id):
        """Analyze skill distribution for user"""
        skill_progress = self.db.skill_progress.find_one({'user_id': user_id})
        
        if not skill_progress:
            return {}
        
        return {name: data['level'] for name, data in skill_progress.get('skills', {}).items()}
    
    def _analyze_difficulty_performance(self, evaluations):
        """Analyze performance across different difficulty levels"""
        difficulty_stats = {'easy': [], 'medium': [], 'hard': []}
        
        for evaluation in evaluations:
            difficulty = evaluation.get('difficulty', 'medium')
            score = evaluation.get('scores', {}).get('overall', 0)
            
            if difficulty in difficulty_stats:
                difficulty_stats[difficulty].append(score)
        
        # Calculate averages
        result = {}
        for difficulty, scores in difficulty_stats.items():
            if scores:
                result[difficulty] = {
                    'average_score': round(sum(scores) / len(scores), 2),
                    'attempts': len(scores),
                    'success_rate': round((sum(1 for s in scores if s >= 70) / len(scores)) * 100, 2)
                }
            else:
                result[difficulty] = {
                    'average_score': 0,
                    'attempts': 0,
                    'success_rate': 0
                }
        
        return result

    # Enhanced Phase 2 Methods
    
    def save_code_submission(self, submission_data):
        """
        Save code submission with version history
        
        Args:
            submission_data (dict): Code submission data including:
                - user_id: User identifier
                - problem_id: Problem identifier  
                - code: Source code
                - language: Programming language
                - status: Submission status (submitted, running, completed, failed)
                - execution_result: Execution results if available
                - version: Version number for this problem
                
        Returns:
            str: MongoDB ObjectId of saved submission
        """
        try:
            # Add metadata
            submission_data.update({
                'timestamp': datetime.now(timezone.utc),
                'code_length': len(submission_data.get('code', '')),
                'submission_type': submission_data.get('submission_type', 'manual')
            })
            
            # Get version number for this user-problem combination
            last_submission = self.db.code_submissions.find_one(
                {
                    "user_id": submission_data['user_id'],
                    "problem_id": submission_data['problem_id']
                },
                sort=[("version", -1)]
            )
            
            submission_data['version'] = (last_submission.get('version', 0) + 1) if last_submission else 1
            
            # Insert submission
            result = self.db.code_submissions.insert_one(submission_data)
            
            # Update submission analytics
            self._update_submission_analytics(submission_data)
            
            print(f"Code submission saved with ID: {result.inserted_id}")
            return str(result.inserted_id)
            
        except Exception as e:
            print(f"Error saving code submission: {e}")
            raise
    
    def get_code_submission_history(self, user_id, problem_id=None, limit=50):
        """
        Get code submission history for a user
        
        Args:
            user_id (str): User identifier
            problem_id (str, optional): Specific problem ID
            limit (int): Maximum submissions to return
            
        Returns:
            list: List of code submissions with version history
        """
        try:
            query = {"user_id": user_id}
            if problem_id:
                query["problem_id"] = problem_id
            
            submissions = list(
                self.db.code_submissions.find(query)
                .sort([("problem_id", 1), ("version", -1)])
                .limit(limit)
            )
            
            # Convert ObjectId to string and format timestamps
            for submission in submissions:
                submission["_id"] = str(submission["_id"])
                if isinstance(submission.get("timestamp"), datetime):
                    submission["timestamp"] = submission["timestamp"].isoformat()
            
            return submissions
            
        except Exception as e:
            print(f"Error fetching code submission history: {e}")
            return []
    
    def update_skill_progress(self, user_id, skill_data):
        """
        Update skill-based progress tracking
        
        Args:
            user_id (str): User identifier
            skill_data (dict): Skill performance data including:
                - skill_name: Name of the skill
                - problem_id: Related problem ID
                - score: Performance score (0-100)
                - mastery_level: Current mastery level
                - time_spent: Time spent on skill
        """
        try:
            # Get or create skill progress document
            skill_progress = self.db.skill_progress.find_one({"user_id": user_id})
            
            if not skill_progress:
                skill_progress = {
                    "user_id": user_id,
                    "skills": {},
                    "overall_progress": 0.0,
                    "learning_velocity": 0.0,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
            
            skill_name = skill_data['skill_name']
            current_time = datetime.now(timezone.utc)
            
            # Initialize skill if not exists
            if skill_name not in skill_progress["skills"]:
                skill_progress["skills"][skill_name] = {
                    "mastery_level": 0.0,
                    "total_attempts": 0,
                    "total_score": 0.0,
                    "recent_scores": [],
                    "time_spent": 0.0,
                    "problems_solved": [],
                    "difficulty_progression": [],
                    "first_attempt": current_time,
                    "last_attempt": current_time
                }
            
            skill_info = skill_progress["skills"][skill_name]
            
            # Update skill metrics
            skill_info["total_attempts"] += 1
            skill_info["total_score"] += skill_data.get('score', 0)
            skill_info["time_spent"] += skill_data.get('time_spent', 0)
            skill_info["last_attempt"] = current_time
            
            # Update recent scores (keep last 10)
            skill_info["recent_scores"].append({
                "score": skill_data.get('score', 0),
                "timestamp": current_time,
                "problem_id": skill_data.get('problem_id')
            })
            skill_info["recent_scores"] = skill_info["recent_scores"][-10:]
            
            # Track problems solved
            if skill_data.get('problem_id') not in skill_info["problems_solved"]:
                skill_info["problems_solved"].append(skill_data.get('problem_id'))
            
            # Calculate mastery level using exponential moving average
            recent_average = sum(s["score"] for s in skill_info["recent_scores"]) / len(skill_info["recent_scores"])
            alpha = 0.3  # Learning rate
            skill_info["mastery_level"] = (alpha * recent_average + 
                                         (1 - alpha) * skill_info["mastery_level"]) / 100.0
            
            # Track difficulty progression
            if skill_data.get('difficulty'):
                skill_info["difficulty_progression"].append({
                    "difficulty": skill_data['difficulty'],
                    "score": skill_data.get('score', 0),
                    "timestamp": current_time
                })
                skill_info["difficulty_progression"] = skill_info["difficulty_progression"][-20:]
            
            # Calculate overall progress
            all_masteries = [skill["mastery_level"] for skill in skill_progress["skills"].values()]
            skill_progress["overall_progress"] = sum(all_masteries) / len(all_masteries) if all_masteries else 0.0
            
            # Calculate learning velocity (improvement rate)
            self._calculate_learning_velocity(skill_progress)
            
            skill_progress["updated_at"] = current_time
            
            # Upsert skill progress
            self.db.skill_progress.replace_one(
                {"user_id": user_id},
                skill_progress,
                upsert=True
            )
            
            print(f"Skill progress updated for {user_id}: {skill_name}")
            
        except Exception as e:
            print(f"Error updating skill progress: {e}")
            raise
    
    def get_skill_progress(self, user_id):
        """
        Get comprehensive skill progress for a user
        
        Args:
            user_id (str): User identifier
            
        Returns:
            dict: Skill progress data with analytics
        """
        try:
            skill_progress = self.db.skill_progress.find_one({"user_id": user_id})
            
            if not skill_progress:
                return {
                    "user_id": user_id,
                    "skills": {},
                    "overall_progress": 0.0,
                    "learning_velocity": 0.0,
                    "analytics": {}
                }
            
            # Add analytics
            skill_progress["analytics"] = self._calculate_skill_analytics(skill_progress)
            
            # Convert ObjectId and timestamps
            if "_id" in skill_progress:
                skill_progress["_id"] = str(skill_progress["_id"])
            
            for timestamp_field in ["created_at", "updated_at"]:
                if isinstance(skill_progress.get(timestamp_field), datetime):
                    skill_progress[timestamp_field] = skill_progress[timestamp_field].isoformat()
            
            return skill_progress
            
        except Exception as e:
            print(f"Error fetching skill progress: {e}")
            return {}
    
    def get_learning_analytics(self, user_id, days=30):
        """
        Get comprehensive learning analytics for a user
        
        Args:
            user_id (str): User identifier
            days (int): Number of days to analyze
            
        Returns:
            dict: Learning analytics data
        """
        try:
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
            
            # Get recent evaluations
            recent_evaluations = list(
                self.db.evaluations.find({
                    "user_id": user_id,
                    "timestamp": {"$gte": cutoff_date}
                }).sort("timestamp", 1)
            )
            
            # Get recent code submissions
            recent_submissions = list(
                self.db.code_submissions.find({
                    "user_id": user_id,
                    "timestamp": {"$gte": cutoff_date}
                }).sort("timestamp", 1)
            )
            
            # Calculate analytics
            analytics = {
                "time_period": f"Last {days} days",
                "activity_summary": {
                    "total_problems_attempted": len(recent_evaluations),
                    "total_code_submissions": len(recent_submissions),
                    "unique_problems": len(set(e.get("problem_id") for e in recent_evaluations)),
                    "success_rate": 0.0,
                    "average_score": 0.0
                },
                "daily_activity": self._calculate_daily_activity(recent_evaluations, recent_submissions, days),
                "difficulty_distribution": self._calculate_difficulty_distribution(recent_evaluations),
                "skill_improvement": self._calculate_skill_improvement(user_id, cutoff_date),
                "learning_patterns": self._analyze_learning_patterns(recent_evaluations, recent_submissions)
            }
            
            # Calculate success rate and average score
            if recent_evaluations:
                successful = sum(1 for e in recent_evaluations if e.get("all_passed", False))
                analytics["activity_summary"]["success_rate"] = (successful / len(recent_evaluations)) * 100
                
                total_score = sum(e.get("scores", {}).get("overall", 0) for e in recent_evaluations)
                analytics["activity_summary"]["average_score"] = total_score / len(recent_evaluations)
            
            return analytics
            
        except Exception as e:
            print(f"Error calculating learning analytics: {e}")
            return {}
    
    def _update_submission_analytics(self, submission_data):
        """Update submission analytics for user"""
        try:
            user_id = submission_data['user_id']
            
            # Get or create analytics document
            analytics = self.db.submission_analytics.find_one({"user_id": user_id})
            
            if not analytics:
                analytics = {
                    "user_id": user_id,
                    "total_submissions": 0,
                    "languages_used": {},
                    "average_code_length": 0,
                    "submission_frequency": {},
                    "created_at": datetime.now(timezone.utc)
                }
            
            # Update metrics
            analytics["total_submissions"] += 1
            language = submission_data.get('language', 'unknown')
            analytics["languages_used"][language] = analytics["languages_used"].get(language, 0) + 1
            
            # Update average code length
            code_length = submission_data.get('code_length', 0)
            current_avg = analytics.get("average_code_length", 0)
            total_subs = analytics["total_submissions"]
            analytics["average_code_length"] = ((current_avg * (total_subs - 1)) + code_length) / total_subs
            
            analytics["updated_at"] = datetime.now(timezone.utc)
            
            # Upsert analytics
            self.db.submission_analytics.replace_one(
                {"user_id": user_id},
                analytics,
                upsert=True
            )
            
        except Exception as e:
            print(f"Error updating submission analytics: {e}")
    
    def _calculate_learning_velocity(self, skill_progress):
        """Calculate learning velocity based on skill improvement over time"""
        try:
            velocities = []
            
            for skill_name, skill_data in skill_progress["skills"].items():
                recent_scores = skill_data.get("recent_scores", [])
                
                if len(recent_scores) >= 3:
                    # Calculate improvement rate from first to last score
                    first_score = recent_scores[0]["score"]
                    last_score = recent_scores[-1]["score"]
                    
                    first_time = recent_scores[0]["timestamp"]
                    last_time = recent_scores[-1]["timestamp"]
                    
                    time_diff = (last_time - first_time).total_seconds() / 3600  # Convert to hours
                    
                    if time_diff > 0:
                        velocity = (last_score - first_score) / time_diff
                        velocities.append(velocity)
            
            skill_progress["learning_velocity"] = sum(velocities) / len(velocities) if velocities else 0.0
            
        except Exception as e:
            print(f"Error calculating learning velocity: {e}")
            skill_progress["learning_velocity"] = 0.0
    
    def _calculate_skill_analytics(self, skill_progress):
        """Calculate detailed skill analytics"""
        analytics = {
            "strongest_skills": [],
            "weakest_skills": [],
            "most_improved": [],
            "needs_attention": [],
            "skill_distribution": {}
        }
        
        try:
            skills_with_mastery = [
                (name, data["mastery_level"], data) 
                for name, data in skill_progress["skills"].items()
            ]
            
            # Sort by mastery level
            skills_with_mastery.sort(key=lambda x: x[1], reverse=True)
            
            # Strongest and weakest skills
            analytics["strongest_skills"] = [
                {"skill": name, "mastery": round(mastery, 2)} 
                for name, mastery, _ in skills_with_mastery[:5]
            ]
            
            analytics["weakest_skills"] = [
                {"skill": name, "mastery": round(mastery, 2)} 
                for name, mastery, _ in skills_with_mastery[-5:]
            ]
            
            # Calculate improvement (comparing recent vs older scores)
            improvement_data = []
            for name, mastery, data in skills_with_mastery:
                recent_scores = data.get("recent_scores", [])
                if len(recent_scores) >= 5:
                    old_avg = sum(s["score"] for s in recent_scores[-5:-2]) / 3
                    new_avg = sum(s["score"] for s in recent_scores[-3:]) / 3
                    improvement = new_avg - old_avg
                    improvement_data.append((name, improvement))
            
            improvement_data.sort(key=lambda x: x[1], reverse=True)
            analytics["most_improved"] = [
                {"skill": name, "improvement": round(imp, 1)} 
                for name, imp in improvement_data[:3]
            ]
            
            # Skills needing attention (low mastery + recent poor performance)
            analytics["needs_attention"] = [
                {"skill": name, "mastery": round(mastery, 2)} 
                for name, mastery, data in skills_with_mastery 
                if mastery < 0.4 and data.get("total_attempts", 0) > 2
            ][:5]
            
            # Skill distribution
            mastery_ranges = {"Beginner (0-30%)": 0, "Intermediate (30-70%)": 0, "Advanced (70-100%)": 0}
            for _, mastery, _ in skills_with_mastery:
                if mastery < 0.3:
                    mastery_ranges["Beginner (0-30%)"] += 1
                elif mastery < 0.7:
                    mastery_ranges["Intermediate (30-70%)"] += 1
                else:
                    mastery_ranges["Advanced (70-100%)"] += 1
            
            analytics["skill_distribution"] = mastery_ranges
            
        except Exception as e:
            print(f"Error calculating skill analytics: {e}")
        
        return analytics
    
    def _calculate_daily_activity(self, evaluations, submissions, days):
        """Calculate daily activity pattern"""
        daily_data = {}
        
        # Initialize days
        for i in range(days):
            date = (datetime.now(timezone.utc) - timedelta(days=i)).strftime('%Y-%m-%d')
            daily_data[date] = {"evaluations": 0, "submissions": 0, "total_score": 0}
        
        # Count evaluations
        for eval_data in evaluations:
            date = eval_data["timestamp"].strftime('%Y-%m-%d')
            if date in daily_data:
                daily_data[date]["evaluations"] += 1
                daily_data[date]["total_score"] += eval_data.get("scores", {}).get("overall", 0)
        
        # Count submissions
        for sub_data in submissions:
            date = sub_data["timestamp"].strftime('%Y-%m-%d')
            if date in daily_data:
                daily_data[date]["submissions"] += 1
        
        return daily_data
    
    def _calculate_difficulty_distribution(self, evaluations):
        """Calculate distribution of problem difficulties attempted"""
        distribution = {"easy": 0, "medium": 0, "hard": 0}
        
        for eval_data in evaluations:
            difficulty = eval_data.get("problem_difficulty", "medium")
            if difficulty in distribution:
                distribution[difficulty] += 1
        
        return distribution
    
    def _calculate_skill_improvement(self, user_id, cutoff_date):
        """Calculate skill improvement over time period"""
        try:
            skill_progress = self.db.skill_progress.find_one({"user_id": user_id})
            if not skill_progress:
                return {}
            
            improvements = {}
            for skill_name, skill_data in skill_progress["skills"].items():
                recent_scores = [
                    s for s in skill_data.get("recent_scores", [])
                    if s["timestamp"] >= cutoff_date
                ]
                
                if len(recent_scores) >= 2:
                    first_score = recent_scores[0]["score"]
                    last_score = recent_scores[-1]["score"]
                    improvement = last_score - first_score
                    improvements[skill_name] = round(improvement, 1)
            
            return improvements
            
        except Exception as e:
            print(f"Error calculating skill improvement: {e}")
            return {}
    
    def _analyze_learning_patterns(self, evaluations, submissions):
        """Analyze learning patterns and habits"""
        patterns = {
            "peak_hours": {},
            "session_length": [],
            "problem_solving_speed": [],
            "retry_patterns": {}
        }
        
        try:
            # Analyze peak hours
            for eval_data in evaluations:
                hour = eval_data["timestamp"].hour
                patterns["peak_hours"][hour] = patterns["peak_hours"].get(hour, 0) + 1
            
            # Group activities by day to calculate session lengths
            daily_activities = {}
            for eval_data in evaluations:
                date = eval_data["timestamp"].date()
                if date not in daily_activities:
                    daily_activities[date] = []
                daily_activities[date].append(eval_data["timestamp"])
            
            # Calculate session lengths
            for date, timestamps in daily_activities.items():
                if len(timestamps) > 1:
                    timestamps.sort()
                    session_length = (timestamps[-1] - timestamps[0]).total_seconds() / 60  # minutes
                    patterns["session_length"].append(session_length)
            
            # Analyze retry patterns (multiple submissions for same problem)
            problem_attempts = {}
            for sub_data in submissions:
                problem_id = sub_data.get("problem_id")
                if problem_id:
                    problem_attempts[problem_id] = problem_attempts.get(problem_id, 0) + 1
            
            retry_counts = list(problem_attempts.values())
            if retry_counts:
                patterns["retry_patterns"] = {
                    "average_attempts_per_problem": round(sum(retry_counts) / len(retry_counts), 1),
                    "max_attempts": max(retry_counts),
                    "problems_with_multiple_attempts": sum(1 for count in retry_counts if count > 1)
                }
            
        except Exception as e:
            print(f"Error analyzing learning patterns: {e}")
        
        return patterns

    def close_connection(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            print("Database connection closed")

# Singleton instance
db_service = DatabaseService()
