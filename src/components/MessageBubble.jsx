import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ message, language }) => {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const renderPreview = (preview) => {
    if (!preview) return null;

    switch (preview.type) {
      case 'pdf':
        return (
          <div className="message-preview pdf">
            <i className="document-icon" />
            <a href={preview.url} target="_blank" rel="noopener noreferrer">
              {preview.title}
            </a>
          </div>
        );
      case 'contact':
        return (
          <div className="message-preview contact">
            <a href={`mailto:${preview.email}`}>{preview.email}</a>
            <a href={`tel:${preview.phone}`}>{preview.phone}</a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`message-bubble ${message.sender} ${message.sentiment || ''}`}>
      <img 
        src={message.avatar} 
        alt={`${message.sender} avatar`} 
        className="message-avatar" 
      />
      <div className="message-content">
        <p>{message.text}</p>
        {message.preview && renderPreview(message.preview)}
        <span className="timestamp">{formattedTime}</span>
      </div>
    </div>
  );
};

export default MessageBubble; 