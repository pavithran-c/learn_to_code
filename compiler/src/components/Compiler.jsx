import React, { useState } from 'react';

const Compiler = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');

  const handleRun = async () => {
    setOutput('Code compilation feature coming soon!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Simple Compiler</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Language:
          </label>
          <select 
            value={language} 
            onChange={e => setLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code Editor:
          </label>
          <textarea
            rows={12}
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Write your code here..."
            className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>

        <button 
          onClick={handleRun}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 mb-6"
        >
          Run Code
        </button>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Output:</h3>
          <pre className="bg-gray-100 p-4 rounded-md border overflow-x-auto text-sm">
            {output || 'No output yet...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Compiler;