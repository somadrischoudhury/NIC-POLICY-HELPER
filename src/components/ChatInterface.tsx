import { useChatBot } from '../hooks/useChatBot';
import { AlertCircle, X, Send, Loader2, User, Bot } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export default function ChatInterface({ onClose }: { onClose?: () => void }) {
  const { messages, sendMessage, isLoading, error } = useChatBot();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-peacock-blue p-4 text-white flex justify-between items-center shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-turquoise rounded-lg flex items-center justify-center">
            <Bot className="text-peacock-blue w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-none">NATIONAL CHATBOT</h2>
            <p className="text-turquoise text-[10px] mt-1">Text Support Expert</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-peacock-blue/80 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 p-3 border-b border-red-100 flex items-center gap-2 text-red-700 shrink-0">
          <AlertCircle className="w-4 h-4" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 opacity-60">
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
              <Send className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-center text-sm max-w-[200px]">
              Type your query below to get instant clarification on NICL policies.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[90%] rounded-2xl p-3 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-peacock-blue text-white rounded-br-sm' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
              }`}>
                <div className="text-[10px] font-bold mb-1 opacity-70 uppercase tracking-tighter flex items-center gap-1">
                  {msg.role === 'user' ? <User className="w-2 h-2" /> : <Bot className="w-2 h-2" />}
                  {msg.role === 'user' ? 'You' : 'National Bot'}
                </div>
                <div className="prose prose-xs max-w-none prose-p:leading-snug prose-pre:my-0 text-sm">
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
            </motion.div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-peacock-blue animate-spin" />
              <span className="text-xs text-slate-500 font-medium tracking-tight">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2"
        >
          <input 
            type="text" 
            placeholder="Ask a question..." 
            className="bg-transparent border-none outline-none flex-1 text-sm text-slate-700"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="text-peacock-blue hover:text-peacock-blue/80 disabled:opacity-30 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
