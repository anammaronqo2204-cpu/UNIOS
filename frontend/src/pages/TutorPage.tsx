import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your UniOS AI Tutor. What would you like to learn about today? Upload a lecture, ask a question, or tell me what course you're working on!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Simulate AI response (will connect to backend)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `That's a great question about "${userMessage.slice(0, 50)}..." Let me break this down for you.\n\nFirst, let's understand the core concept. Think of it like this: **everything builds on fundamentals**.\n\nWhat would you like me to explain first?`,
        },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-light-gray px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-vibrant-violet to-electric-blue flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-near-black">AI Tutor</h1>
            <p className="text-xs text-dark-gray">Powered by UniOS Unified Brain</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-vibrant-violet/10 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-vibrant-violet" />
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-vibrant-violet text-white rounded-br-md'
                  : 'bg-off-white text-near-black rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-electric-blue/10 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-electric-blue" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-vibrant-violet/10 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-vibrant-violet" />
            </div>
            <div className="bg-off-white rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-mid-gray rounded-full animate-typing" />
                <span className="w-2 h-2 bg-mid-gray rounded-full animate-typing" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 bg-mid-gray rounded-full animate-typing" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-light-gray px-6 py-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything about your studies..."
              className="input-field resize-none pr-12"
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 rounded-lg bg-vibrant-violet text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-vibrant-violet/90 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}