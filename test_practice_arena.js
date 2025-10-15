// Test script to verify Practice Arena API integration
async function testPracticeArenaAPI() {
    try {
        console.log('Testing Practice Arena API...');
        
        // Test loading problems from backend
        const response = await fetch('http://localhost:5000/api/problems');
        const data = await response.json();
        
        console.log('API Response Status:', response.status);
        console.log('Problems loaded:', data.length);
        console.log('Sample problem:', data[0]);
        
        // Test that we have 205 problems as expected
        if (data.length === 205) {
            console.log('✅ SUCCESS: All 205 problems loaded correctly');
        } else {
            console.log('❌ ISSUE: Expected 205 problems, got', data.length);
        }
        
        // Test difficulty distribution
        const difficulties = data.reduce((acc, problem) => {
            acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
            return acc;
        }, {});
        
        console.log('Difficulty distribution:', difficulties);
        
        // Test that problems have required fields
        const sampleProblem = data[0];
        const requiredFields = ['title', 'description', 'difficulty', 'id'];
        const missingFields = requiredFields.filter(field => !sampleProblem[field]);
        
        if (missingFields.length === 0) {
            console.log('✅ SUCCESS: All required fields present');
        } else {
            console.log('❌ ISSUE: Missing fields:', missingFields);
        }
        
    } catch (error) {
        console.error('❌ ERROR testing API:', error);
    }
}

// Run the test
testPracticeArenaAPI();