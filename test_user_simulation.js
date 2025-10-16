// Test script to simulate logged-in user and verify dashboard display
// This will set user data in localStorage to test the dashboard

console.log('🧪 Dashboard User Display Test');
console.log('Setting up test user data...');

// Simulate authenticated user data that would come from the backend
const testUser = {
  id: 'test123',
  name: 'Sujith Kumar',
  email: 'sujith@example.com',
  avatar: 'SK'
};

// Simulate auth tokens
const testTokens = {
  access_token: 'test_access_token_123',
  refresh_token: 'test_refresh_token_456'
};

// Set up localStorage as if user just logged in
localStorage.setItem('user', JSON.stringify(testUser));
localStorage.setItem('access_token', testTokens.access_token);
localStorage.setItem('refresh_token', testTokens.refresh_token);

console.log('✅ Test user data set in localStorage:');
console.log('👤 User:', testUser);

console.log('\n📊 Expected Dashboard Behavior:');
console.log('- Name should display: "Sujith Kumar"');
console.log('- Avatar should be: "SK"');
console.log('- Should NOT show: "Alex Thompson"');

console.log('\n🔄 Please refresh the dashboard page to see changes');
console.log('🌐 Navigate to: /dashboard');

// Dispatch a storage event to trigger any listeners
window.dispatchEvent(new StorageEvent('storage', {
  key: 'user',
  newValue: JSON.stringify(testUser),
  storageArea: localStorage
}));