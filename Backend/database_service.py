"""
MongoDB Database Service for Learning Platform
Handles user evaluations, problem solving status, and progress tracking
"""

import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError
from datetime import datetime, timezone
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
    
    def close_connection(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            print("Database connection closed")

# Singleton instance
db_service = DatabaseService()
