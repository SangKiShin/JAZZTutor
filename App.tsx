import React, { useState, useRef, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import PhilosophySidebar from './components/PhilosophySidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ApiKeyModal, { loadApiKey } from './components/ApiKeyModal';
import { sendMessageToGemini } from './services/gemini';
import { Message } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "**안녕하세요, 뮤지션님.**\n\n저는 당신의 내면의 소리를 찾도록 돕는 가이드입니다. \n\n지금 당신의 연주나 연습 과정에서 어떤 부분이 당신을 괴롭히고 있나요? \n기술적인 문제인가요, 아니면 마음의 문제인가요? \n\n무엇이든 털어놓으세요. 우리는 천천히, 그리고 깊게 나아갈 것입니다.",
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // API Key State
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load API key on startup
  useEffect(() => {
    const savedKey = loadApiKey();
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      // If no key found, prompt user
      setIsKeyModalOpen(true);
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!apiKey) {
      setIsKeyModalOpen(true);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(messages.concat(userMessage), text, apiKey);
      const botMessage: Message = {
        role: 'model',
        content: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        role: 'model',
        content: `오류가 발생했습니다: ${error.message || "연결이 불안정합니다."}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
  };

  return (
    <div className="flex h-screen bg-jazz-900 overflow-hidden font-sans">
      <ApiKeyModal 
        isOpen={isKeyModalOpen} 
        onClose={() => setIsKeyModalOpen(false)} 
        onSave={handleSaveApiKey}
        initialKey={apiKey}
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile) */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col w-80 bg-jazz-900">
           <button 
            className="absolute top-4 right-4 text-gray-400 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
          <PhilosophySidebar onOpenSettings={() => setIsKeyModalOpen(true)} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-jazz-700 bg-jazz-900">
          <h1 className="font-serif text-xl font-bold text-white">The Inner Ear</h1>
          <button 
            className="text-jazz-gold"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-2">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-6">
                <div className="flex flex-row gap-4 max-w-[75%]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-jazz-gold text-jazz-900 flex items-center justify-center shadow-lg animate-pulse">
                    <div className="w-2 h-2 bg-jazz-900 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-jazz-900 rounded-full animate-bounce delay-150 mx-1"></div>
                    <div className="w-2 h-2 bg-jazz-900 rounded-full animate-bounce delay-300"></div>
                  </div>
                  <div className="flex items-center text-jazz-600 text-sm italic">
                    내면의 흐름을 조율하는 중...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default App;