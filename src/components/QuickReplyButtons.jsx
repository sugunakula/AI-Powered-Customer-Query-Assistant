import React from 'react';
import './QuickReplyButtons.css';

const QuickReplyButtons = ({ onSelect }) => {
  const quickReplies = [
    'Track my order',
    'Return policy',
    'Product availability',
    'Contact support'
  ];

  return (
    <div className="quick-reply-container">
      {quickReplies.map((reply, index) => (
        <button
          key={index}
          className="quick-reply-button"
          onClick={() => onSelect(reply)}
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

export default QuickReplyButtons; 