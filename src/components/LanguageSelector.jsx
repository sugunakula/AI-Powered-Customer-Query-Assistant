import React from 'react';
import './LanguageSelector.css';

const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' }
  ];

  return (
    <select 
      className="language-selector"
      value={currentLanguage}
      onChange={(e) => onLanguageChange(e.target.value)}
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector; 