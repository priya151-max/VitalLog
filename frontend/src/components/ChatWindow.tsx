import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Upload, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Visualization } from './Visualization';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  analysis?: any;
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, onUpload, isLoading }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-secondary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">VitalLog AI</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-widest">Medical Engine Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar z-10">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 rounded-3xl"
            >
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-white/10">
                <Info className="text-brand-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Welcome to VitalLog</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Upload a medical report or describe your symptoms. Our AI uses a proprietary medical knowledge base to simplify complex findings for you.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <button 
                  onClick={() => onSendMessage("I have low hemoglobin levels.")}
                  className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all text-slate-300"
                >
                  "Hemoglobin levels?"
                </button>
                <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="bg-brand-primary/10 hover:bg-brand-primary/20 p-3 rounded-xl border border-brand-primary/20 transition-all text-brand-primary"
                >
                  "Upload Report"
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-6 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Bot size={20} className="text-brand-primary" />
                </div>
              )}
              
              <div className={`max-w-[85%] space-y-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-5 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/10 rounded-tr-none' 
                    : 'glass-card text-slate-200 rounded-tl-none leading-relaxed'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none
                      prose-headings:text-white prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2
                      prose-h3:text-base prose-h3:text-blue-300
                      prose-p:text-slate-200 prose-p:leading-relaxed prose-p:my-2
                      prose-li:text-slate-300 prose-li:my-1
                      prose-ul:my-2 prose-ul:pl-4
                      prose-strong:text-white prose-strong:font-semibold
                    ">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                {/* Rich Analysis Context */}
                {msg.analysis && (
                  <div className="space-y-4 animate-in">
                    <div className="flex gap-2 flex-wrap">
                      <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-blue-500" />
                        <span className="text-[10px] font-bold uppercase text-blue-500">{msg.analysis.specialty}</span>
                      </div>
                      <div className={`border px-3 py-1 rounded-lg flex items-center gap-2 ${
                        msg.analysis.urgency === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                        msg.analysis.urgency === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      }`}>
                        <AlertCircle size={14} />
                        <span className="text-[10px] font-bold uppercase">{msg.analysis.urgency} URGENCY</span>
                      </div>
                    </div>
                    
                    <Visualization entities={msg.analysis.entities} />
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-brand-primary" />
                </div>
              )}
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
                <Bot size={20} className="text-brand-primary animate-pulse" />
              </div>
              <div className="glass-card p-5 rounded-2xl rounded-tl-none flex gap-2">
                <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 z-10">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-4 items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 flex items-center justify-center glass-card hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
            title="Upload medical report"
          >
            <Upload size={20} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms or ask about your report..."
              className="w-full glass-input p-4 pr-14 rounded-2xl text-white placeholder:text-slate-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 w-10 h-10 flex items-center justify-center bg-brand-primary hover:bg-blue-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-brand-primary shadow-lg shadow-brand-primary/20"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        <p className="text-[10px] text-center text-slate-600 mt-4 uppercase tracking-[0.2em] font-bold">
          AI Analysis • Not a medical substitute • Consult a Doctor
        </p>
      </div>
    </div>
  );
};
