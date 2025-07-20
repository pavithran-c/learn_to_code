import React from 'react';
import { motion } from 'framer-motion';

const CommandPalette = ({ commands, setShowCommandPalette, isDarkMode }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`fixed top-20 left-1/2 transform -translate-x-1/2 w-96 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-xl rounded-lg p-4 z-50`}
    role="dialog"
    aria-label="Command Palette"
  >
    <input
      type="text"
      placeholder="Type a command..."
      className={`w-full border rounded-lg p-2 mb-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
      autoFocus
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          const command = commands.find(c => c.name.toLowerCase().includes(e.target.value.toLowerCase()));
          if (command) command.action();
          setShowCommandPalette(false);
        }
      }}
    />
    <div className="max-h-64 overflow-y-auto">
      {commands.map((cmd, index) => (
        <button
          key={index}
          className={`w-full text-left p-2 hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}
          onClick={() => {
            cmd.action();
            setShowCommandPalette(false);
          }}
        >
          {cmd.name}
        </button>
      ))}
    </div>
  </motion.div>
);

export default CommandPalette;
