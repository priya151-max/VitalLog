import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Upload, Camera, Volume2, Languages, Loader2, Info, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Visualization } from './Visualization';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  analysis?: any;
}

interface MedicalBotProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  onUpload: (file: File) => void;
  isLoading: boolean;
  lang: 'en' | 'ta';
  onToggleLang: () => void;
}

export const MedicalBot: React.FC<MedicalBotProps> = ({ 
  messages, onSendMessage, onUpload, isLoading, lang, onToggleLang 
}) => {
  const [input, setInput] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-US' : 'ta-IN';
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 backdrop-blur-sm">
      {/* Top Header Bar */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/20 rounded-xl">
            <Bot className="text-brand-primary" size={20} />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">VitalLog Assistant</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Clinical Brain Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleLang}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all text-xs font-bold"
          >
            <Languages size={14} />
            {lang === 'en' ? 'English' : 'தமிழ்'}
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="p-6 bg-brand-primary/10 rounded-[2.5rem] mb-6">
              <Sparkles size={48} className="text-brand-primary" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">How can I help you today?</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload your medical reports, take a photo of your prescription, or simply ask about your health metrics.
            </p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-slate-800 text-brand-primary border border-white/5'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div className={`p-4 rounded-2xl relative group ${
                  msg.role === 'user' 
                    ? 'bg-brand-primary text-white rounded-tr-none' 
                    : 'glass-card text-slate-200 rounded-tl-none border border-white/10'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                      <button 
                        onClick={() => speak(msg.content)}
                        className="mt-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Read Aloud"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                {/* Analysis Indicators */}
                {msg.analysis && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.analysis.specialty && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md flex items-center gap-1">
                        <Info size={10} /> {msg.analysis.specialty}
                      </span>
                    )}
                    {msg.analysis.urgency === 'high' && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md flex items-center gap-1">
                        <AlertTriangle size={10} /> Urgent Attention
                      </span>
                    )}
                  </div>
                )}
                
                {msg.analysis?.entities?.length > 0 && (
                  <div className="mt-4 w-full overflow-hidden rounded-2xl border border-white/5">
                    <Visualization entities={msg.analysis.entities} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
          <div className="flex items-end gap-3 bg-slate-900/80 border border-white/10 rounded-[2rem] p-3 focus-within:border-brand-primary/50 transition-all shadow-2xl backdrop-blur-xl">
            <div className="flex gap-2 mb-1 pl-2">
              <label className="p-3 text-slate-400 hover:text-brand-primary hover:bg-white/5 rounded-full transition-all cursor-pointer">
                <Upload size={20} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,.pdf" 
                  onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} 
                />
              </label>
              <button 
                type="button"
                className="p-3 text-slate-400 hover:text-brand-primary hover:bg-white/5 rounded-full transition-all"
              >
                <Camera size={20} />
              </button>
            </div>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'en' ? "Describe your symptoms or upload a report..." : "உங்கள் அறிகுறிகளை விவரிக்கவும் அல்லது அறிக்கையைப் பதிவேற்றவும்..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 py-3 resize-none max-h-32 min-h-[44px] custom-scrollbar"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-2xl transition-all shadow-lg mb-1 mr-1 ${
                input.trim() && !isLoading 
                  ? 'bg-brand-primary text-white hover:scale-105 active:scale-95 shadow-brand-primary/20' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-4 font-bold uppercase tracking-widest">
            AI medical analysis can be incorrect. Always consult a human doctor.
          </p>
        </form>
      </div>
    </div>
  );
};
