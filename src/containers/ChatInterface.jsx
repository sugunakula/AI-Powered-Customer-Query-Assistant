import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { useTheme } from '../contexts/ThemeContext';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import QuickReplyButtons from '../components/QuickReplyButtons';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/ChatInterface.css';

// AI Assistant Illustration
const AIAssistantIllustration = () => (
  <svg
    className="chat-ai-assistant"
    width="200"
    height="200"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Gradients */}
    <defs>
      <radialGradient
        id="gradientOuter"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(100 100) rotate(90) scale(100)"
      >
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
      </radialGradient>
      <linearGradient
        id="gradientMiddle"
        x1="50"
        y1="100"
        x2="150"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="gradientInner"
        x1="70"
        y1="100"
        x2="130"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="faceGradient"
        x1="80"
        y1="80"
        x2="120"
        y2="80"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="antennaGradient"
        x1="100"
        y1="55"
        x2="100"
        y2="40"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="dotGradient1"
        x1="135"
        y1="100"
        x2="145"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="dotGradient2"
        x1="55"
        y1="100"
        x2="65"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="dotGradient3"
        x1="95"
        y1="140"
        x2="105"
        y2="140"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="pulseGradient"
        x1="60"
        y1="100"
        x2="140"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>

    {/* Layers */}
    <g>
      {/* Outer Glow */}
      <circle cx="100" cy="100" r="90" fill="url(#gradientOuter)" fillOpacity="0.15" />
      {/* Middle Ring */}
      <circle
        cx="100"
        cy="100"
        r="60"
        stroke="url(#gradientMiddle)"
        strokeWidth="3"
        strokeDasharray="5 5"
      />
      {/* Inner Core */}
      <circle cx="100" cy="100" r="40" fill="url(#gradientInner)" fillOpacity="0.3" />
    </g>

    {/* Bot Face */}
    <g className="bot-face">
      <circle cx="100" cy="80" r="25" fill="url(#faceGradient)" />
      <circle cx="90" cy="73" r="4" fill="#fff" />
      <circle cx="110" cy="73" r="4" fill="#fff" />
      <path
        d="M90 90 Q100 100 110 90"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </g>

    {/* Antenna */}
    <g className="antenna">
      <line x1="100" y1="55" x2="100" y2="40" stroke="url(#antennaGradient)" strokeWidth="3" />
      <circle cx="100" cy="35" r="6" fill="url(#antennaGradient)" />
    </g>

    {/* Orbiting Elements */}
    <g className="orbiting-elements">
      <circle cx="140" cy="100" r="6" fill="url(#dotGradient1)" />
      <circle cx="60" cy="100" r="6" fill="url(#dotGradient2)" />
      <circle cx="100" cy="140" r="6" fill="url(#dotGradient3)" />
    </g>

    {/* Pulse Effect */}
    <circle
      className="pulse"
      cx="100"
      cy="100"
      r="50"
      stroke="url(#pulseGradient)"
      strokeWidth="2"
      strokeDasharray="4 4"
      fill="none"
    />

    {/* Animation Styles */}
    <style>{`
      .orbiting-elements {
        animation: orbit 12s linear infinite;
        transform-origin: 100px 100px;
      }
      .pulse {
        animation: pulse 2.5s ease-in-out infinite;
        transform-origin: 100px 100px;
      }
      @keyframes orbit {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0% { opacity: 0.3; transform: scale(0.9); }
        50% { opacity: 1; transform: scale(1.1); }
        100% { opacity: 0.3; transform: scale(0.9); }
      }
    `}</style>
  </svg>
);

const ChatInterface = () => {
  const { messages, isTyping, sendMessage } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
    setInputMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-title">
          <h2>Customer Support</h2>
          <AIAssistantIllustration />
        </div>
        <div className="chat-controls">
          <LanguageSelector 
            currentLanguage={language} 
            onLanguageChange={setLanguage} 
          />
          <ThemeToggle 
            isDarkMode={isDarkMode} 
            onToggle={toggleTheme} 
          />
        </div>
      </div>

      <div className="chat-messages">
        {messages.map(message => (
          <MessageBubble
            key={message.id}
            message={message}
            language={language}
          />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      <QuickReplyButtons 
        onSelect={(text) => setInputMessage(text)} 
        suggestions={messages[messages.length - 1]?.quickReplies || []}
      />

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={language === 'en' ? "Type your message..." : "Escriba su mensaje..."}
          className="chat-input"
        />
        <button type="submit" className="send-button">
          {language === 'en' ? 'Send' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface; 