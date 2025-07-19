import React, { useRef, useState } from 'react'
import './App.css'

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleRun = async () => {
    setOutput('');
    setError('');
    const endpoint = language === 'python' ? '/run/python' : '/run/java';
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setOutput(data.stdout);
      setError(data.stderr);
    } catch (err) {
      setError('Failed to connect to backend.');
    }
  };

  return (
    <>
      <div style={{ maxWidth: 700, margin: 'auto', padding: 20 }}>
        <h2>Web Compiler</h2>
        <select value={language} onChange={e => setLanguage(e.target.value)}>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <br /><br />
        <textarea
          rows={12}
          cols={80}
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Write your code here..."
        />
        <br />
        <button onClick={handleRun}>Run</button>
        <h3>Output:</h3>
        <pre style={{ background: '#eee', padding: 10 }}>{output}</pre>
        {error && (
          <>
            <h3 style={{ color: 'red' }}>Error:</h3>
            <pre style={{ background: '#fee', padding: 10 }}>{error}</pre>
          </>
        )}
      </div>
    </>
  )
}

export default App
