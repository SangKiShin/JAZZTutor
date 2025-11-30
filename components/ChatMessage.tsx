import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Music2 } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg
          ${isUser ? 'bg-jazz-700 text-gray-300' : 'bg-jazz-gold text-jazz-900'}`}>
          {isUser ? <User size={20} /> : <Music2 size={20} />}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-6 py-4 rounded-2xl shadow-md text-sm md:text-base leading-relaxed
            ${isUser 
              ? 'bg-jazz-700 text-gray-100 rounded-tr-none' 
              : 'bg-jazz-800 text-gray-200 border border-jazz-700 rounded-tl-none'
            }`}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-jazz-gold prose-headings:font-serif prose-headings:text-jazz-gold prose-a:text-jazz-accent">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}
          </div>
          <span className="text-xs text-jazz-600 mt-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;