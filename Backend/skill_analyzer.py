"""
Skill Analyzer - Phase 3: Skill Gap Identification and Improvement Paths
Identifies weak areas and suggests targeted improvement strategies
"""

import numpy as np
import math
from typing import Dict, List, Tuple, Optional, Any, Set
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import statistics
from database_service import db_service
from learning_analytics import LearningAnalytics

@dataclass
class SkillLevel:
    """Represents skill level in a specific area"""
    concept: str
    mastery_score: float  # 0.0 to 1.0
    confidence_interval: Tuple[float, float]
    sample_size: int
    last_assessment: datetime
    progression_rate: float  # How quickly improving
    stability_score: float   # How stable the assessment is

@dataclass
class ConceptDependency:
    """Represents dependency between concepts"""
    prerequisite: str
    dependent: str
    strength: float  # How strongly dependent (0.0 to 1.0)
    evidence_count: int

@dataclass
class SkillGap:
    """Detailed skill gap analysis"""
    concept: str
    gap_severity: float  # 0.0 to 1.0 (1.0 = critical gap)
    current_level: float
    target_level: float
    blocking_dependencies: List[str]  # Concepts that depend on this
    prerequisite_gaps: List[str]      # Prerequisites that need work first
    evidence: List[Dict[str, Any]]
    impact_score: float               # How much this gap affects overall progress
    difficulty_estimation: float     # How hard to close this gap
    time_investment_needed: int       # Estimated hours
    
@dataclass
class ImprovementPath:
    """Structured improvement path for skill development"""
    target_concept: str
    learning_sequence: List[str]      # Ordered list of concepts to learn
    milestones: List[Dict[str, Any]]  # Checkpoints along the way
    total_time_estimate: int          # Total hours needed
    difficulty_curve: List[float]     # Expected difficulty progression
    success_criteria: Dict[str, float]
    recommended_resources: List[Dict[str, str]]
    practice_problems: List[Dict[str, Any]]

@dataclass
class LearningRecommendation:
    """Specific learning recommendation"""
    recommendation_type: str  # 'foundation', 'practice', 'challenge', 'review'
    priority: str            # 'critical', 'high', 'medium', 'low'
    title: str
    description: str
    specific_actions: List[str]
    success_metrics: Dict[str, float]
    estimated_time: int      # minutes
    difficulty_level: float
    concepts_addressed: List[str]

class SkillAnalyzer:
    """Advanced skill gap identification and improvement path generation"""
    
    def __init__(self):
        self.db = db_service.db
        self.analytics = LearningAnalytics()
        
        # Concept taxonomy and dependencies
        self.concept_hierarchy = self._build_concept_hierarchy()
        self.concept_dependencies = self._build_dependency_graph()
        self.skill_assessments = {}
        
        # Assessment configuration
        self.config = {
            'min_samples_for_assessment': 3,
            'mastery_threshold': 0.7,
            'confidence_threshold': 0.8,
            'gap_severity_threshold': 0.6,
            'critical_gap_threshold': 0.8,
            'recency_weight_days': 30,
            'assessment_decay_rate': 0.95  # How much old assessments decay
        }
    
    def _build_concept_hierarchy(self) -> Dict[str, Dict[str, Any]]:
        """Build hierarchical concept structure"""
        return {
            'basics': {
                'level': 1,
                'concepts': ['variables', 'data_types', 'operators', 'input_output'],
                'description': 'Fundamental programming concepts'
            },
            'control_flow': {
                'level': 2,
                'concepts': ['conditionals', 'loops', 'boolean_logic'],
                'description': 'Program flow control structures',
                'prerequisites': ['basics']
            },
            'functions': {
                'level': 3,
                'concepts': ['function_definition', 'parameters', 'return_values', 'scope'],
                'description': 'Function concepts and modularity',
                'prerequisites': ['basics', 'control_flow']
            },
            'data_structures': {
                'level': 4,
                'concepts': ['arrays', 'lists', 'strings', 'dictionaries', 'sets'],
                'description': 'Data organization and manipulation',
                'prerequisites': ['functions']
            },
            'algorithms': {
                'level': 5,
                'concepts': ['sorting', 'searching', 'recursion', 'complexity_analysis'],
                'description': 'Algorithmic thinking and analysis',
                'prerequisites': ['data_structures']
            },
            'advanced_structures': {
                'level': 6,
                'concepts': ['trees', 'graphs', 'heaps', 'hash_tables'],
                'description': 'Advanced data structures',
                'prerequisites': ['algorithms']
            },
            'advanced_algorithms': {
                'level': 7,
                'concepts': ['dynamic_programming', 'graph_algorithms', 'greedy_algorithms'],
                'description': 'Advanced algorithmic techniques',
                'prerequisites': ['advanced_structures']
            },
            'specialized': {
                'level': 8,
                'concepts': ['machine_learning', 'databases', 'web_development', 'system_design'],
                'description': 'Specialized application areas',
                'prerequisites': ['advanced_algorithms']
            }
        }
    
    def _build_dependency_graph(self) -> Dict[str, List[ConceptDependency]]:
        """Build concept dependency relationships"""
        dependencies = defaultdict(list)
        
        # Define explicit dependencies with strengths
        dependency_rules = [
            ('variables', 'arrays', 0.9),
            ('variables', 'functions', 0.8),
            ('arrays', 'strings', 0.7),
            ('functions', 'recursion', 0.9),
            ('arrays', 'sorting', 0.8),
            ('recursion', 'trees', 0.9),
            ('trees', 'graphs', 0.7),
            ('arrays', 'dynamic_programming', 0.6),
            ('recursion', 'dynamic_programming', 0.8),
            ('loops', 'algorithms', 0.7),
            ('conditionals', 'algorithms', 0.6),
            ('data_structures', 'system_design', 0.8)
        ]
        
        for prereq, dependent, strength in dependency_rules:
            dep = ConceptDependency(
                prerequisite=prereq,
                dependent=dependent,
                strength=strength,
                evidence_count=10  # Default evidence count
            )
            dependencies[prereq].append(dep)
        
        return dependencies
    
    def assess_user_skills(self, user_id: str) -> Dict[str, SkillLevel]:
        """Comprehensive skill assessment for user"""
        # Get user's submission history
        submissions = list(self.db.evaluations.find({
            'user_id': user_id
        }).sort('submission_time', 1))
        
        if not submissions:
            return {}
        
        skill_levels = {}
        
        # Analyze each concept
        all_concepts = set()
        for category in self.concept_hierarchy.values():
            all_concepts.update(category['concepts'])
        
        for concept in all_concepts:
            skill_level = self._assess_concept_skill(user_id, concept, submissions)
            if skill_level:
                skill_levels[concept] = skill_level
        
        return skill_levels
    
    def _assess_concept_skill(self, user_id: str, concept: str, submissions: List[Dict]) -> Optional[SkillLevel]:
        """Assess skill level for a specific concept"""
        # Filter submissions related to this concept
        concept_submissions = [
            s for s in submissions 
            if concept in s.get('concepts', [])
        ]
        
        if len(concept_submissions) < self.config['min_samples_for_assessment']:
            return None
        
        # Calculate mastery score with recency weighting
        scores = []
        weights = []
        now = datetime.now()
        
        for submission in concept_submissions:
            # Base score
            score = 1.0 if submission.get('all_passed', False) else 0.0
            
            # Adjust for partial success
            if not score and 'results' in submission:
                results = submission['results']
                if results:
                    passed_tests = sum(1 for r in results if r.get('passed', False))
                    score = passed_tests / len(results)
            
            # Time-based weight (more recent = higher weight)
            submission_time = datetime.fromisoformat(submission['submission_time'])
            days_ago = (now - submission_time).days
            weight = math.exp(-days_ago / self.config['recency_weight_days'])
            
            scores.append(score)
            weights.append(weight)
        
        # Calculate weighted mastery score
        weighted_sum = sum(s * w for s, w in zip(scores, weights))
        weight_sum = sum(weights)
        mastery_score = weighted_sum / weight_sum if weight_sum > 0 else 0.0
        
        # Calculate confidence interval
        if len(scores) >= 3:
            std_error = statistics.stdev(scores) / math.sqrt(len(scores))
            confidence_margin = 1.96 * std_error  # 95% confidence
            confidence_interval = (
                max(0.0, mastery_score - confidence_margin),
                min(1.0, mastery_score + confidence_margin)
            )
        else:
            confidence_interval = (max(0.0, mastery_score - 0.3), min(1.0, mastery_score + 0.3))
        
        # Calculate progression rate
        if len(scores) >= 5:
            recent_scores = scores[-5:]
            early_scores = scores[:5]
            progression_rate = statistics.mean(recent_scores) - statistics.mean(early_scores)
        else:
            progression_rate = 0.0
        
        # Calculate stability score
        if len(scores) >= 3:
            stability_score = 1.0 - (statistics.stdev(scores[-5:]) if len(scores) >= 5 else statistics.stdev(scores))
        else:
            stability_score = 0.5
        
        return SkillLevel(
            concept=concept,
            mastery_score=mastery_score,
            confidence_interval=confidence_interval,
            sample_size=len(concept_submissions),
            last_assessment=now,
            progression_rate=progression_rate,
            stability_score=max(0.0, min(1.0, stability_score))
        )
    
    def identify_skill_gaps(self, user_id: str) -> List[SkillGap]:
        """Identify critical skill gaps and their impact"""
        skill_levels = self.assess_user_skills(user_id)
        
        if not skill_levels:
            return []
        
        gaps = []
        
        for concept, skill in skill_levels.items():
            # Identify if this is a gap
            if skill.mastery_score < self.config['mastery_threshold']:
                gap_severity = 1.0 - skill.mastery_score
                
                # Only consider significant gaps
                if gap_severity >= self.config['gap_severity_threshold']:
                    gap = self._analyze_skill_gap(concept, skill, skill_levels)
                    gaps.append(gap)
        
        # Also check for missing foundational concepts
        missing_gaps = self._identify_missing_prerequisites(skill_levels)
        gaps.extend(missing_gaps)
        
        # Sort by impact score (most impactful gaps first)
        gaps.sort(key=lambda g: g.impact_score, reverse=True)
        
        return gaps
    
    def _analyze_skill_gap(self, concept: str, skill: SkillLevel, all_skills: Dict[str, SkillLevel]) -> SkillGap:
        """Analyze a specific skill gap in detail"""
        gap_severity = 1.0 - skill.mastery_score
        target_level = self.config['mastery_threshold']
        
        # Find concepts that depend on this one
        blocking_dependencies = []
        for dep_concept, dependencies in self.concept_dependencies.items():
            for dep in dependencies:
                if dep.dependent in all_skills and dep.prerequisite == concept:
                    blocking_dependencies.append(dep.dependent)
        
        # Find prerequisite gaps
        prerequisite_gaps = []
        for category in self.concept_hierarchy.values():
            if concept in category['concepts']:
                prereqs = category.get('prerequisites', [])
                for prereq_category in prereqs:
                    prereq_concepts = self.concept_hierarchy[prereq_category]['concepts']
                    for prereq_concept in prereq_concepts:
                        if (prereq_concept in all_skills and 
                            all_skills[prereq_concept].mastery_score < self.config['mastery_threshold']):
                            prerequisite_gaps.append(prereq_concept)
        
        # Calculate impact score
        impact_score = self._calculate_impact_score(concept, gap_severity, blocking_dependencies)
        
        # Estimate difficulty and time
        difficulty_estimation = self._estimate_learning_difficulty(concept, skill)
        time_investment = self._estimate_time_investment(concept, gap_severity, difficulty_estimation)
        
        # Gather evidence
        evidence = self._gather_gap_evidence(concept, skill)
        
        return SkillGap(
            concept=concept,
            gap_severity=gap_severity,
            current_level=skill.mastery_score,
            target_level=target_level,
            blocking_dependencies=blocking_dependencies,
            prerequisite_gaps=prerequisite_gaps,
            evidence=evidence,
            impact_score=impact_score,
            difficulty_estimation=difficulty_estimation,
            time_investment_needed=time_investment
        )
    
    def _identify_missing_prerequisites(self, skill_levels: Dict[str, SkillLevel]) -> List[SkillGap]:
        """Identify missing prerequisite concepts"""
        gaps = []
        
        for category_name, category in self.concept_hierarchy.items():
            # Check if user has attempted concepts in this category
            has_attempts = any(concept in skill_levels for concept in category['concepts'])
            
            if has_attempts:
                # Check prerequisites
                prerequisites = category.get('prerequisites', [])
                for prereq_category in prerequisites:
                    prereq_concepts = self.concept_hierarchy[prereq_category]['concepts']
                    
                    for prereq_concept in prereq_concepts:
                        if prereq_concept not in skill_levels:
                            # This is a missing prerequisite
                            gap = SkillGap(
                                concept=prereq_concept,
                                gap_severity=1.0,  # Complete gap
                                current_level=0.0,
                                target_level=self.config['mastery_threshold'],
                                blocking_dependencies=category['concepts'],
                                prerequisite_gaps=[],
                                evidence=[{'type': 'missing_prerequisite', 'description': f'Required for {category_name}'}],
                                impact_score=0.8,  # High impact for missing prerequisites
                                difficulty_estimation=0.5,  # Moderate difficulty
                                time_investment_needed=self._estimate_time_investment(prereq_concept, 1.0, 0.5)
                            )
                            gaps.append(gap)
        
        return gaps
    
    def _calculate_impact_score(self, concept: str, gap_severity: float, blocking_dependencies: List[str]) -> float:
        """Calculate how much this gap impacts overall progress"""
        # Base impact from gap severity
        impact = gap_severity * 0.4
        
        # Add impact from blocking other concepts
        blocking_impact = len(blocking_dependencies) * 0.2
        impact += min(0.4, blocking_impact)
        
        # Add impact based on concept level in hierarchy
        concept_level = 1
        for category in self.concept_hierarchy.values():
            if concept in category['concepts']:
                concept_level = category['level']
                break
        
        # Lower level concepts have higher impact
        level_impact = (9 - concept_level) / 8 * 0.2
        impact += level_impact
        
        return min(1.0, impact)
    
    def _estimate_learning_difficulty(self, concept: str, skill: SkillLevel) -> float:
        """Estimate how difficult it will be to learn this concept"""
        # Base difficulty from concept level
        concept_level = 1
        for category in self.concept_hierarchy.values():
            if concept in category['concepts']:
                concept_level = category['level']
                break
        
        base_difficulty = concept_level / 8  # Normalize to 0-1
        
        # Adjust based on current skill level
        skill_adjustment = (1.0 - skill.mastery_score) * 0.3
        
        # Adjust based on stability (less stable = harder to improve)
        stability_adjustment = (1.0 - skill.stability_score) * 0.2
        
        total_difficulty = base_difficulty + skill_adjustment + stability_adjustment
        
        return min(1.0, total_difficulty)
    
    def _estimate_time_investment(self, concept: str, gap_severity: float, difficulty: float) -> int:
        """Estimate time needed to close the gap (in hours)"""
        # Base time estimates by concept type
        base_times = {
            'variables': 2, 'data_types': 3, 'operators': 2, 'input_output': 2,
            'conditionals': 4, 'loops': 6, 'boolean_logic': 3,
            'function_definition': 5, 'parameters': 3, 'return_values': 3, 'scope': 4,
            'arrays': 8, 'lists': 6, 'strings': 5, 'dictionaries': 6, 'sets': 4,
            'sorting': 10, 'searching': 8, 'recursion': 12, 'complexity_analysis': 8,
            'trees': 15, 'graphs': 18, 'heaps': 10, 'hash_tables': 8,
            'dynamic_programming': 20, 'graph_algorithms': 15, 'greedy_algorithms': 12
        }
        
        base_time = base_times.get(concept, 10)  # Default 10 hours
        
        # Adjust for gap severity and difficulty
        time_multiplier = 0.5 + (gap_severity * 0.5) + (difficulty * 0.5)
        
        return int(base_time * time_multiplier)
    
    def _gather_gap_evidence(self, concept: str, skill: SkillLevel) -> List[Dict[str, Any]]:
        """Gather evidence for why this is identified as a gap"""
        evidence = []
        
        # Low mastery score
        evidence.append({
            'type': 'low_mastery',
            'description': f'Mastery score: {skill.mastery_score:.2f} (target: {self.config["mastery_threshold"]:.2f})',
            'severity': 1.0 - skill.mastery_score
        })
        
        # Low sample size
        if skill.sample_size < 5:
            evidence.append({
                'type': 'insufficient_practice',
                'description': f'Only {skill.sample_size} practice attempts',
                'severity': 0.5
            })
        
        # Negative progression
        if skill.progression_rate < -0.1:
            evidence.append({
                'type': 'declining_performance',
                'description': f'Performance declining: {skill.progression_rate:.2f}',
                'severity': abs(skill.progression_rate)
            })
        
        # Low stability
        if skill.stability_score < 0.5:
            evidence.append({
                'type': 'inconsistent_performance',
                'description': f'Inconsistent performance: {skill.stability_score:.2f}',
                'severity': 1.0 - skill.stability_score
            })
        
        return evidence
    
    def generate_improvement_path(self, user_id: str, target_concept: str) -> ImprovementPath:
        """Generate a structured learning path to master a concept"""
        skill_levels = self.assess_user_skills(user_id)
        gaps = self.identify_skill_gaps(user_id)
        
        # Find the target gap
        target_gap = None
        for gap in gaps:
            if gap.concept == target_concept:
                target_gap = gap
                break
        
        if not target_gap:
            # Create a basic improvement path
            target_gap = SkillGap(
                concept=target_concept,
                gap_severity=0.5,
                current_level=skill_levels.get(target_concept, SkillLevel(target_concept, 0.0, (0.0, 0.0), 0, datetime.now(), 0.0, 0.5)).mastery_score,
                target_level=self.config['mastery_threshold'],
                blocking_dependencies=[],
                prerequisite_gaps=[],
                evidence=[],
                impact_score=0.5,
                difficulty_estimation=0.5,
                time_investment_needed=10
            )
        
        # Build learning sequence
        learning_sequence = self._build_learning_sequence(target_concept, skill_levels)
        
        # Create milestones
        milestones = self._create_learning_milestones(learning_sequence, target_gap)
        
        # Calculate total time
        total_time = sum(self._estimate_time_investment(concept, 0.5, 0.5) for concept in learning_sequence)
        
        # Generate difficulty curve
        difficulty_curve = [self._estimate_learning_difficulty(concept, skill_levels.get(concept, SkillLevel(concept, 0.0, (0.0, 0.0), 0, datetime.now(), 0.0, 0.5))) for concept in learning_sequence]
        
        # Create success criteria
        success_criteria = {
            'overall_mastery': self.config['mastery_threshold'],
            'minimum_problems_solved': 15,
            'consistency_threshold': 0.7
        }
        
        # Recommend resources and problems
        resources = self._recommend_learning_resources(learning_sequence)
        practice_problems = self._recommend_practice_problems(learning_sequence)
        
        return ImprovementPath(
            target_concept=target_concept,
            learning_sequence=learning_sequence,
            milestones=milestones,
            total_time_estimate=total_time,
            difficulty_curve=difficulty_curve,
            success_criteria=success_criteria,
            recommended_resources=resources,
            practice_problems=practice_problems
        )
    
    def _build_learning_sequence(self, target_concept: str, skill_levels: Dict[str, SkillLevel]) -> List[str]:
        """Build optimal learning sequence to reach target concept"""
        sequence = []
        
        # Find concept category and prerequisites
        target_category = None
        for category_name, category in self.concept_hierarchy.items():
            if target_concept in category['concepts']:
                target_category = category
                break
        
        if not target_category:
            return [target_concept]
        
        # Add prerequisite concepts that need work
        prerequisites = target_category.get('prerequisites', [])
        for prereq_category_name in prerequisites:
            prereq_category = self.concept_hierarchy[prereq_category_name]
            for prereq_concept in prereq_category['concepts']:
                if (prereq_concept not in skill_levels or 
                    skill_levels[prereq_concept].mastery_score < self.config['mastery_threshold']):
                    sequence.append(prereq_concept)
        
        # Add the target concept
        sequence.append(target_concept)
        
        # Remove duplicates while preserving order
        seen = set()
        ordered_sequence = []
        for concept in sequence:
            if concept not in seen:
                ordered_sequence.append(concept)
                seen.add(concept)
        
        return ordered_sequence
    
    def _create_learning_milestones(self, learning_sequence: List[str], target_gap: SkillGap) -> List[Dict[str, Any]]:
        """Create learning milestones for the improvement path"""
        milestones = []
        
        # Create milestone for each major concept
        for i, concept in enumerate(learning_sequence):
            milestone = {
                'sequence_number': i + 1,
                'concept': concept,
                'title': f'Master {concept.replace("_", " ").title()}',
                'description': f'Achieve {self.config["mastery_threshold"]:.0%} mastery in {concept}',
                'success_criteria': {
                    'mastery_score': self.config['mastery_threshold'],
                    'minimum_attempts': 5,
                    'consistency_required': 0.7
                },
                'estimated_time': self._estimate_time_investment(concept, 0.5, 0.5),
                'practice_problems_needed': max(5, int(self._estimate_time_investment(concept, 0.5, 0.5) / 2))
            }
            milestones.append(milestone)
        
        return milestones
    
    def _recommend_learning_resources(self, learning_sequence: List[str]) -> List[Dict[str, str]]:
        """Recommend learning resources for the concepts"""
        resources = []
        
        resource_database = {
            'variables': [
                {'type': 'tutorial', 'title': 'Python Variables Basics', 'url': '#', 'difficulty': 'beginner'},
                {'type': 'practice', 'title': 'Variable Assignment Exercises', 'url': '#', 'difficulty': 'beginner'}
            ],
            'loops': [
                {'type': 'tutorial', 'title': 'Mastering For and While Loops', 'url': '#', 'difficulty': 'intermediate'},
                {'type': 'video', 'title': 'Loop Patterns Explained', 'url': '#', 'difficulty': 'intermediate'}
            ],
            'recursion': [
                {'type': 'tutorial', 'title': 'Understanding Recursion', 'url': '#', 'difficulty': 'advanced'},
                {'type': 'practice', 'title': 'Recursive Problem Solving', 'url': '#', 'difficulty': 'advanced'}
            ],
            'dynamic_programming': [
                {'type': 'course', 'title': 'Dynamic Programming Masterclass', 'url': '#', 'difficulty': 'expert'},
                {'type': 'practice', 'title': 'DP Problem Collection', 'url': '#', 'difficulty': 'expert'}
            ]
        }
        
        for concept in learning_sequence:
            if concept in resource_database:
                resources.extend(resource_database[concept])
            else:
                # Default resource
                resources.append({
                    'type': 'tutorial',
                    'title': f'{concept.replace("_", " ").title()} Guide',
                    'url': '#',
                    'difficulty': 'intermediate'
                })
        
        return resources
    
    def _recommend_practice_problems(self, learning_sequence: List[str]) -> List[Dict[str, Any]]:
        """Recommend specific practice problems"""
        problems = []
        
        problem_database = {
            'variables': [
                {'title': 'Variable Swap', 'difficulty': 'easy', 'concepts': ['variables']},
                {'title': 'Temperature Converter', 'difficulty': 'easy', 'concepts': ['variables', 'operators']}
            ],
            'loops': [
                {'title': 'Sum of Numbers', 'difficulty': 'easy', 'concepts': ['loops', 'variables']},
                {'title': 'Pattern Printing', 'difficulty': 'medium', 'concepts': ['loops', 'strings']}
            ],
            'arrays': [
                {'title': 'Find Maximum Element', 'difficulty': 'easy', 'concepts': ['arrays', 'loops']},
                {'title': 'Array Rotation', 'difficulty': 'medium', 'concepts': ['arrays', 'algorithms']}
            ],
            'recursion': [
                {'title': 'Factorial Calculation', 'difficulty': 'medium', 'concepts': ['recursion']},
                {'title': 'Tree Traversal', 'difficulty': 'hard', 'concepts': ['recursion', 'trees']}
            ]
        }
        
        for concept in learning_sequence:
            if concept in problem_database:
                problems.extend(problem_database[concept])
        
        return problems
    
    def generate_learning_recommendations(self, user_id: str, limit: int = 10) -> List[LearningRecommendation]:
        """Generate prioritized learning recommendations"""
        gaps = self.identify_skill_gaps(user_id)
        skill_levels = self.assess_user_skills(user_id)
        
        recommendations = []
        
        # Critical gap recommendations
        critical_gaps = [g for g in gaps if g.gap_severity >= self.config['critical_gap_threshold']]
        for gap in critical_gaps[:3]:  # Top 3 critical gaps
            rec = LearningRecommendation(
                recommendation_type='foundation',
                priority='critical',
                title=f'Address Critical Gap: {gap.concept.replace("_", " ").title()}',
                description=f'Your {gap.concept} skills need immediate attention. This gap is blocking progress in {len(gap.blocking_dependencies)} other areas.',
                specific_actions=[
                    f'Complete 5 {gap.concept} practice problems',
                    f'Review {gap.concept} fundamentals',
                    f'Practice until reaching {self.config["mastery_threshold"]:.0%} success rate'
                ],
                success_metrics={'mastery_threshold': self.config['mastery_threshold']},
                estimated_time=gap.time_investment_needed * 60,  # Convert to minutes
                difficulty_level=gap.difficulty_estimation,
                concepts_addressed=[gap.concept]
            )
            recommendations.append(rec)
        
        # Practice recommendations for improving areas
        improving_skills = [
            (concept, skill) for concept, skill in skill_levels.items()
            if 0.4 <= skill.mastery_score < self.config['mastery_threshold'] and skill.progression_rate > 0
        ]
        
        for concept, skill in improving_skills[:2]:
            rec = LearningRecommendation(
                recommendation_type='practice',
                priority='high',
                title=f'Build on Progress: {concept.replace("_", " ").title()}',
                description=f'You\'re improving in {concept} (current: {skill.mastery_score:.0%}). Keep the momentum going!',
                specific_actions=[
                    f'Solve 3 more {concept} problems',
                    'Focus on consistency',
                    'Challenge yourself with harder variants'
                ],
                success_metrics={'target_mastery': self.config['mastery_threshold']},
                estimated_time=120,  # 2 hours
                difficulty_level=0.6,
                concepts_addressed=[concept]
            )
            recommendations.append(rec)
        
        # Challenge recommendations for strong areas
        strong_skills = [
            (concept, skill) for concept, skill in skill_levels.items()
            if skill.mastery_score >= self.config['mastery_threshold']
        ]
        
        if strong_skills:
            concept, skill = strong_skills[0]  # Pick strongest skill
            rec = LearningRecommendation(
                recommendation_type='challenge',
                priority='medium',
                title=f'Advanced Challenge: {concept.replace("_", " ").title()}',
                description=f'You\'ve mastered {concept}. Time for advanced applications!',
                specific_actions=[
                    'Tackle competition-level problems',
                    'Explore optimization techniques',
                    'Teach others to reinforce learning'
                ],
                success_metrics={'advanced_problem_success': 0.6},
                estimated_time=180,  # 3 hours
                difficulty_level=0.8,
                concepts_addressed=[concept]
            )
            recommendations.append(rec)
        
        # Review recommendations for declining areas
        declining_skills = [
            (concept, skill) for concept, skill in skill_levels.items()
            if skill.progression_rate < -0.1
        ]
        
        for concept, skill in declining_skills[:2]:
            rec = LearningRecommendation(
                recommendation_type='review',
                priority='high',
                title=f'Review Needed: {concept.replace("_", " ").title()}',
                description=f'Your {concept} performance is declining. A quick review can help.',
                specific_actions=[
                    f'Review {concept} fundamentals',
                    'Identify common mistakes',
                    'Practice with easier problems first'
                ],
                success_metrics={'stabilize_performance': True},
                estimated_time=90,  # 1.5 hours
                difficulty_level=0.4,
                concepts_addressed=[concept]
            )
            recommendations.append(rec)
        
        # Sort by priority and return limited set
        priority_order = {'critical': 1, 'high': 2, 'medium': 3, 'low': 4}
        recommendations.sort(key=lambda r: (priority_order[r.priority], -r.estimated_time))
        
        return recommendations[:limit]
    
    def get_skill_development_roadmap(self, user_id: str, target_level: str = 'advanced') -> Dict[str, Any]:
        """Generate a comprehensive skill development roadmap"""
        skill_levels = self.assess_user_skills(user_id)
        gaps = self.identify_skill_gaps(user_id)
        
        # Define target levels
        level_definitions = {
            'beginner': {'min_concepts': 5, 'avg_mastery': 0.6, 'max_level': 3},
            'intermediate': {'min_concepts': 12, 'avg_mastery': 0.7, 'max_level': 5},
            'advanced': {'min_concepts': 20, 'avg_mastery': 0.8, 'max_level': 7},
            'expert': {'min_concepts': 30, 'avg_mastery': 0.9, 'max_level': 8}
        }
        
        target_def = level_definitions.get(target_level, level_definitions['advanced'])
        
        # Assess current level
        current_mastered = len([s for s in skill_levels.values() if s.mastery_score >= self.config['mastery_threshold']])
        current_avg_mastery = statistics.mean([s.mastery_score for s in skill_levels.values()]) if skill_levels else 0.0
        
        # Determine current level
        current_level = 'beginner'
        for level, definition in level_definitions.items():
            if (current_mastered >= definition['min_concepts'] and 
                current_avg_mastery >= definition['avg_mastery']):
                current_level = level
        
        # Create roadmap phases
        phases = []
        concepts_to_learn = []
        
        # Find concepts needed for target level
        for category_name, category in self.concept_hierarchy.items():
            if category['level'] <= target_def['max_level']:
                for concept in category['concepts']:
                    if (concept not in skill_levels or 
                        skill_levels[concept].mastery_score < self.config['mastery_threshold']):
                        concepts_to_learn.append((concept, category['level']))
        
        # Group concepts into phases by level
        concepts_by_level = defaultdict(list)
        for concept, level in concepts_to_learn:
            concepts_by_level[level].append(concept)
        
        total_time = 0
        for level in sorted(concepts_by_level.keys()):
            concepts = concepts_by_level[level]
            phase_time = sum(self._estimate_time_investment(concept, 0.5, 0.5) for concept in concepts)
            total_time += phase_time
            
            level_name = {1: 'Foundation', 2: 'Control Flow', 3: 'Functions', 4: 'Data Structures', 
                         5: 'Algorithms', 6: 'Advanced Structures', 7: 'Advanced Algorithms', 8: 'Specialization'}.get(level, f'Level {level}')
            
            phase = {
                'phase_number': level,
                'phase_name': level_name,
                'concepts': concepts,
                'estimated_time_hours': phase_time,
                'success_criteria': {
                    'concepts_mastered': len(concepts),
                    'average_mastery_required': self.config['mastery_threshold']
                }
            }
            phases.append(phase)
        
        roadmap = {
            'current_level': current_level,
            'target_level': target_level,
            'current_stats': {
                'concepts_mastered': current_mastered,
                'average_mastery': current_avg_mastery,
                'skill_gaps_count': len(gaps)
            },
            'target_requirements': target_def,
            'learning_phases': phases,
            'total_estimated_time_hours': total_time,
            'estimated_completion_weeks': max(4, total_time // 10),  # Assuming 10 hours per week
            'immediate_priorities': [gap.concept for gap in gaps[:5]],
            'success_metrics': {
                'concepts_to_master': len(concepts_to_learn),
                'target_mastery_average': target_def['avg_mastery'],
                'milestone_checkpoints': len(phases)
            }
        }
        
        return roadmap