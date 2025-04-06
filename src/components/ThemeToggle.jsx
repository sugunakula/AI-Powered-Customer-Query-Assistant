import React from 'react';
import './ThemeToggle.css';

const ThemeToggle = ({ isDarkMode, onToggle }) => {
  return (
    <button 
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle-icon">
        {isDarkMode ? '☀️' : '🌙'}
      </span>
    </button>
  );
};

export default ThemeToggle; 