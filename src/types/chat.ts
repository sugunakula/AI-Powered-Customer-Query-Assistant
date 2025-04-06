export type MessageSender = 'user' | 'ai';
export type MessageSentiment = 'neutral' | 'friendly' | 'informative' | 'supportive' | 'helpful';

export interface Preview {
  type: 'pdf' | 'contact';
  url?: string;
  title?: string;
  email?: string;
  phone?: string;
}

export interface Message {
  id: number;
  text: string;
  sender: MessageSender;
  timestamp: Date;
  avatar: string;
  sentiment?: MessageSentiment;
  quickReplies?: string[];
  preview?: Preview | null;
}

export interface AIResponse {
  text: string;
  sentiment: MessageSentiment;
  quickReplies: string[];
  preview: Preview | null;
} 