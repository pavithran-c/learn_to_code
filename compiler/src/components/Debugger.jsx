import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const Debugger = ({ breakpoints, setShowDebugger, isDarkMode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`fixed bottom-10 left-10 w-96 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-xl rounded-lg p-4 z-50`}
    role="dialog"
    aria-label="Debugger"
  >
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold">Debugger</h3>
      <button onClick={() => setShowDebugger(false)} aria-label="Close debugger">
        <X className="w-5 h-5" />
      </button>
    </div>
    <div className="space-y-2">
      <p className="text-sm">Breakpoints: {breakpoints.join(', ') || 'None'}</p>
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded-lg"
        onClick={() => alert('Simulated step-through execution')}
      >
        Step Through
      </button>
    </div>
  </motion.div>
);

export default Debugger;
