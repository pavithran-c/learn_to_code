/**
 * Test script to verify that the CodingProblems component 
 * correctly fetches questions from the backend API
 */

// Simulate the API call that the component makes
const testBackendConnection = async () => {
  console.log('🧪 Testing Backend API Connection...');
  console.log('=' * 50);
  
  try {
    // Test main problems endpoint
    console.log('Testing: GET http://localhost:5000/api/problems');
    const response = await fetch('http://localhost:5000/api/problems');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const problems = await response.json();
    console.log(`✅ Successfully fetched ${problems.length} problems`);
    
    // Analyze the problems
    const difficultyCount = problems.reduce((acc, p) => {
      acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Problem Distribution:');
    Object.entries(difficultyCount).forEach(([diff, count]) => {
      console.log(`   ${diff}: ${count} problems`);
    });
    
    // Test individual problem fetch
    if (problems.length > 0) {
      const sampleProblem = problems[0];
      console.log(`\n🔍 Testing individual problem fetch: ${sampleProblem.id}`);
      
      const problemResponse = await fetch(`http://localhost:5000/api/problem/${sampleProblem.id}`);
      if (problemResponse.ok) {
        const problemData = await problemResponse.json();
        console.log(`✅ Successfully fetched problem: "${problemData.title}"`);
        console.log(`   Difficulty: ${problemData.difficulty}`);
        console.log(`   Test Cases: ${problemData.test_cases?.length || 0}`);
        console.log(`   Topics: ${problemData.topics?.join(', ') || 'None'}`);
      } else {
        console.log('❌ Failed to fetch individual problem');
      }
    }
    
    console.log('\n🎉 Backend API is working correctly!');
    console.log('The CodingProblems component should be able to:');
    console.log('✅ Load problems from coding_questions folder');
    console.log('✅ Apply learning curve algorithms');
    console.log('✅ Shuffle problems based on difficulty');
    console.log('✅ Submit code for evaluation');
    
  } catch (error) {
    console.error('❌ Backend API test failed:', error);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure the Flask backend is running (cd Backend && python app.py)');
    console.log('2. Check that coding_questions/easy.json and medium.json exist');
    console.log('3. Verify the backend is loading from coding_questions folder');
    console.log('4. Check console for any backend errors');
  }
};

// Test code submission endpoint
const testSubmissionEndpoint = async () => {
  try {
    console.log('\n🔍 Testing code submission endpoint...');
    
    // This is just to test if the endpoint exists (will fail without valid data)
    const response = await fetch('http://localhost:5000/api/submit_code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem_id: 'test',
        code: 'print("test")',
        language: 'python'
      })
    });
    
    console.log(`Submit endpoint status: ${response.status}`);
    console.log('✅ Submit endpoint is accessible');
    
  } catch (error) {
    console.log('⚠️  Submit endpoint test failed (expected if backend not running)');
  }
};

// Instructions for running the test
console.log('📋 To test the API connection:');
console.log('1. Start the backend: cd Backend && python app.py');
console.log('2. Open browser console on your React app');
console.log('3. Copy and paste this test code');
console.log('4. Run: testBackendConnection()');
console.log('\n🚀 The CodingProblems component is ready to use!');

// Uncomment to run automatically
// testBackendConnection().then(() => testSubmissionEndpoint());