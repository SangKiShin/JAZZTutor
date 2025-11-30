export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface PhilosophyItem {
  title: string;
  quote: string;
  author: string;
}