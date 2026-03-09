import { useLiveAPI } from '../hooks/useLiveAPI';
import { Mic, MicOff, AlertCircle, Volume2, Bot, User } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useRef } from 'react';

export default function VoiceAssistant() {
  const { isConnected, isRecording, messages, error, connect, disconnect } = useLiveAPI();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="bg-peacock-blue p-6 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-turquoise rounded-2xl flex items-center justify-center shadow-lg">
            <Volume2 className="text-peacock-blue w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">AI VOICE ASSISTANT</h2>
            <p className="text-turquoise text-xs font-bold uppercase tracking-widest">Real-time Policy Clarification</p>
          </div>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Live Session</span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3 text-red-700 shrink-0">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-6 opacity-60">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
              <Mic className="w-10 h-10 text-slate-300" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-peacock-blue">Speak to National Bot</h3>
              <p className="text-sm max-w-xs mx-auto leading-relaxed">
                Click the microphone below to start a hands-free conversation about your policy doubts.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] rounded-[24px] p-5 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-peacock-blue text-white rounded-br-sm' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
              }`}>
                <div className="text-[10px] font-black mb-2 opacity-70 uppercase tracking-widest flex items-center gap-2">
                  {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  {msg.role === 'user' ? 'You' : 'National Bot'}
                </div>
                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:my-0">
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="p-8 bg-white border-t border-slate-100 flex flex-col items-center gap-4 shrink-0">
        <button
          onClick={isConnected ? disconnect : connect}
          className={`relative group flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 shadow-2xl ${
            isConnected 
              ? 'bg-red-500 hover:bg-red-600 text-white scale-110' 
              : 'bg-turquoise text-peacock-blue hover:scale-110 hover:brightness-110'
          }`}
        >
          {isConnected && (
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" />
          )}
          {isConnected ? (
            <MicOff className="w-10 h-10" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
          {isConnected ? 'Listening... Tap to Stop' : 'Tap to Start Voice Session'}
        </p>
      </div>
    </div>
  );
}
