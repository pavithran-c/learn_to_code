#!/usr/bin/env python3
"""
Test script to verify backend loading from coding_questions folder
"""

import json
import os
import sys

def test_problem_loading():
    """Test that problems load correctly from coding_questions folder"""
    print("🔍 Testing Backend Problem Loading")
    print("=" * 50)
    
    # Change to Backend directory
    if not os.path.exists('coding_questions'):
        if os.path.exists('../coding_questions'):
            os.chdir('..')
        else:
            print("❌ coding_questions folder not found")
            return False
    
    # Test loading function
    def load_problems_from_coding_questions():
        """Load and combine problems from easy.json and medium.json"""
        problems = []
        
        try:
            # Load easy questions
            easy_path = os.path.join('coding_questions', 'easy.json')
            if os.path.exists(easy_path):
                with open(easy_path, 'r', encoding='utf-8') as f:
                    easy_questions = json.load(f)
                    problems.extend(easy_questions)
                    print(f"✅ Loaded {len(easy_questions)} easy questions")
            else:
                print(f"❌ Easy questions file not found: {easy_path}")
            
            # Load medium questions
            medium_path = os.path.join('coding_questions', 'medium.json')
            if os.path.exists(medium_path):
                with open(medium_path, 'r', encoding='utf-8') as f:
                    medium_questions = json.load(f)
                    problems.extend(medium_questions)
                    print(f"✅ Loaded {len(medium_questions)} medium questions")
            else:
                print(f"❌ Medium questions file not found: {medium_path}")
            
            # Process problems
            for i, problem in enumerate(problems):
                # Keep original ID if it exists
                if 'id' not in problem or problem['id'] is None:
                    problem['id'] = i + 1
                
                # Map statement_markdown to description if needed
                if 'description' not in problem and 'statement_markdown' in problem:
                    problem['description'] = problem['statement_markdown']
                
                # Ensure concepts exist
                if 'concepts' not in problem:
                    problem['concepts'] = problem.get('topics', [])
                
                # Ensure required fields exist
                if 'difficulty' not in problem:
                    problem['difficulty'] = 'medium'
                if 'test_cases' not in problem:
                    problem['test_cases'] = []
                if 'starter_code' not in problem:
                    problem['starter_code'] = {'python': '# Write your solution here', 'java': '// Write your solution here'}
            
            print(f"✅ Total problems processed: {len(problems)}")
            return problems
            
        except Exception as e:
            print(f"❌ Error loading problems: {e}")
            return []
    
    # Test the loading
    problems = load_problems_from_coding_questions()
    
    if problems:
        print(f"\n📊 Problem Analysis:")
        
        # Check ID types and format
        id_types = {}
        sample_ids = []
        for p in problems[:10]:  # First 10 for sample
            id_type = type(p['id']).__name__
            id_types[id_type] = id_types.get(id_type, 0) + 1
            sample_ids.append(p['id'])
        
        print(f"   ID Types: {id_types}")
        print(f"   Sample IDs: {sample_ids}")
        
        # Check difficulty distribution
        diff_count = {}
        for p in problems:
            diff = p.get('difficulty', 'unknown')
            diff_count[diff] = diff_count.get(diff, 0) + 1
        
        print(f"   Difficulty Distribution: {diff_count}")
        
        # Check for potential problem cases
        problems_missing_fields = []
        for p in problems:
            missing = []
            if not p.get('title'): missing.append('title')
            if not p.get('description'): missing.append('description')
            if not p.get('test_cases'): missing.append('test_cases')
            if missing:
                problems_missing_fields.append(f"ID {p['id']}: missing {missing}")
        
        if problems_missing_fields:
            print(f"\n⚠️  Problems with missing fields:")
            for prob in problems_missing_fields[:5]:  # Show first 5
                print(f"     {prob}")
            if len(problems_missing_fields) > 5:
                print(f"     ... and {len(problems_missing_fields) - 5} more")
        else:
            print(f"   ✅ All problems have required fields")
        
        # Test API endpoint simulation
        print(f"\n🌐 API Endpoint Simulation:")
        
        # Test /api/problems
        print(f"   GET /api/problems -> {len(problems)} problems")
        
        # Test /api/problem/<id> with different ID types
        test_ids = [problems[0]['id'], problems[-1]['id']] if problems else []
        for test_id in test_ids:
            found = next((p for p in problems if str(p['id']) == str(test_id) or p['id'] == test_id), None)
            print(f"   GET /api/problem/{test_id} -> {'✅ Found' if found else '❌ Not Found'}")
        
        return True
    else:
        print(f"❌ No problems loaded")
        return False

if __name__ == "__main__":
    success = test_problem_loading()
    
    if success:
        print(f"\n🎉 Backend problem loading test PASSED!")
        print(f"\n🚀 Next steps:")
        print(f"   1. Start backend: cd Backend && python app.py")
        print(f"   2. Test frontend connection")
        print(f"   3. Check browser console for any errors")
    else:
        print(f"\n❌ Backend problem loading test FAILED!")
        print(f"\n🔧 Check:")
        print(f"   1. coding_questions/easy.json exists and is valid JSON")
        print(f"   2. coding_questions/medium.json exists and is valid JSON")
        print(f"   3. File permissions and paths are correct")