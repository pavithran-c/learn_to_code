import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { dracula, githubLight, solarizedLight, vscodeDark } from '@uiw/codemirror-themes-all';

const themeOptions = {
  dracula,
  githubLight,
  solarizedLight,
  vscodeDark,
};

const Scratchpad = ({ language, theme, setShowScratchpad, isDarkMode }) => {
  const getLanguageExtension = () => {
    switch (language) {
      case 'python':
        return [python()];
      case 'java':
        return [java()];
      case 'javascript':
        return [javascript()];
      default:
        return [];
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`fixed bottom-10 right-10 w-96 h-64 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-xl rounded-lg p-4 z-50`}
      role="dialog"
      aria-label="Scratchpad"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Scratchpad</h3>
        <button onClick={() => setShowScratchpad(false)} aria-label="Close scratchpad">
          <X className="w-5 h-5" />
        </button>
      </div>
      <CodeMirror
        value=""
        height="200px"
        extensions={getLanguageExtension()}
        theme={themeOptions[theme]}
        className="font-mono"
        basicSetup={{
          autocompletion: true,
          highlightActiveLine: true,
          bracketMatching: true,
          tabSize: 2,
        }}
      />
    </motion.div>
  );
};

export default Scratchpad;
