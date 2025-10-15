/**
 * Debug utility to help identify React rendering issues
 */

// Add this to your browser console to check for React-related errors
console.log('🔍 LearnToCode Debug Information');
console.log('================================');

// Check if React is loaded
if (typeof React !== 'undefined') {
  console.log('✅ React is loaded:', React.version);
} else {
  console.log('❌ React is not found');
}

// Check if ReactDOM is loaded
if (typeof ReactDOM !== 'undefined') {
  console.log('✅ ReactDOM is loaded');
} else {
  console.log('❌ ReactDOM is not found');
}

// Check if the root element exists
const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('✅ Root element found:', rootElement);
  console.log('   Children count:', rootElement.children.length);
} else {
  console.log('❌ Root element (#root) not found');
}

// Check for any unhandled React errors
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', event.error);
});

// Check for React-specific errors
if (window.React && window.React.version) {
  console.log('✅ React version:', window.React.version);
}

// Check current URL and routing
console.log('📍 Current URL:', window.location.href);
console.log('📍 Pathname:', window.location.pathname);

// Check if main app container exists
const appElements = document.querySelectorAll('[data-reactroot], .app, #app');
console.log('🎯 App containers found:', appElements.length);

// Check for any console errors
const originalError = console.error;
console.error = function(...args) {
  console.log('🚨 Console Error detected:', args);
  originalError.apply(console, args);
};

// Monitor for DOM changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      console.log('🔄 DOM updated, new nodes:', mutation.addedNodes.length);
    }
  });
});

if (rootElement) {
  observer.observe(rootElement, { childList: true, subtree: true });
}

console.log('🔍 Debug setup complete. Check above for any issues.');
console.log('💡 If you see "Node not found" errors, check:');
console.log('   1. React component syntax');
console.log('   2. Missing imports');
console.log('   3. Undefined variables in JSX');
console.log('   4. Circular dependencies');
console.log('================================');