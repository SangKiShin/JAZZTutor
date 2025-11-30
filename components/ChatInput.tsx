import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="bg-jazz-900 border-t border-jazz-700 p-4 md:p-6">
      <div className="max-w-4xl mx-auto relative">
        <form onSubmit={handleSubmit} className="relative flex items-end bg-jazz-800 rounded-xl border border-jazz-700 focus-within:border-jazz-gold transition-colors shadow-lg">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="연습 중 겪고 있는 어려움이나 궁금한 점을 이야기해주세요..."
            className="w-full bg-transparent text-gray-200 placeholder-jazz-600 p-4 pr-12 rounded-xl resize-none focus:outline-none max-h-[120px] min-h-[56px] overflow-y-auto custom-scrollbar"
            rows={1}
            disabled={isLoading}
          />
          <div className="absolute right-2 bottom-2">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-lg transition-all duration-300
                ${input.trim() && !isLoading 
                  ? 'bg-jazz-gold text-jazz-900 hover:bg-yellow-500' 
                  : 'bg-jazz-700 text-jazz-600 cursor-not-allowed'}`}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
        <div className="text-center mt-2">
          <p className="text-xs text-jazz-600">
            Inner Ear AI는 때때로 즉흥적인(부정확한) 답변을 할 수 있습니다. 항상 자신의 귀를 믿으세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;