import { useState, useCallback } from 'react';
import { Message } from '../types/chat';
import { fetchAIResponse } from '../services/aiService';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date(),
      avatar: '/avatars/user.png'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetchAIResponse(text);
      setIsTyping(false);
      
      const aiMessage: Message = {
        id: Date.now(),
        text: response.text,
        sender: 'ai',
        timestamp: new Date(),
        avatar: '/avatars/ai.png',
        sentiment: response.sentiment,
        quickReplies: response.quickReplies,
        preview: response.preview
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsTyping(false);
    }
  }, []);

  return {
    messages,
    isTyping,
    sendMessage
  };
}; 