import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Volume2, Paperclip, X, Maximize2, Loader2, Sparkles, Cpu, Brain, Stethoscope, Activity, BarChart3, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Visualization } from './Visualization';
import { ClinicalIntelligence } from './ClinicalIntelligence';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  analysis?: any;
  preview?: string;
  nlp_trace?: any;
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
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [showProcessPanel, setShowProcessPanel] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<any>(null);
  const [activeNlpTrace, setActiveNlpTrace] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show processing steps when loading
  useEffect(() => {
    if (isLoading) {
      setShowProcessPanel(true);
      setProcessingSteps([]);
      const steps = [
        'Tokenizing input text...',
        'Running NLP pipeline (from scratch)...',
        'Identifying relevant health domain...',
        'Assessing supportive priority level...',
        'Extracting medication names...',
        'Parsing actionable instructions...',
        'Evaluating emotional tone...',
        'Generating LLM enrichment (20%)...',
      ];
      steps.forEach((step, i) => {
        setTimeout(() => {
          setProcessingSteps(prev => [...prev, step]);
        }, i * 350);
      });
    }
  }, [isLoading]);

  // When a new assistant message arrives with analysis, keep panel open
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'assistant' && lastMsg?.analysis) {
      setActiveAnalysis(lastMsg.analysis);
      setActiveNlpTrace(lastMsg.nlp_trace || null);
      setShowProcessPanel(true);
    }
  }, [messages]);

  const speak = (text: string, idx: number) => {
    if (isSpeaking === idx) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }
    window.speechSynthesis.cancel();

    // Clean text: strip markdown characters (** , #, etc.) and extra symbols
    const cleanText = text
      .replace(/\*\*/g, '')           // Remove bold
      .replace(/\*/g, '')            // Remove italics
      .replace(/#/g, '')             // Remove headings
      .replace(/>/g, '')             // Remove blockquotes
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/[:]/g, ' ')          // Replace colons with spaces for better flow
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (lang === 'ta') {
      utterance.lang = 'ta-IN';
      // Force pick a Tamil voice if available (Browsers sometimes ignore .lang)
      const voices = window.speechSynthesis.getVoices();
      const tamilVoice = voices.find(v => v.lang.includes('ta'));
      if (tamilVoice) utterance.voice = tamilVoice;
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onend = () => setIsSpeaking(null);
    utterance.onstart = () => setIsSpeaking(idx);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      setActiveAnalysis(null);
      setActiveNlpTrace(null);
      onSendMessage(input);
      setInput('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="flex h-full overflow-hidden relative">
      {/* === LEFT: Chat Area === */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-20">
              <motion.div 
                animate={{ y: [0, -12, 0], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="p-8 bg-gradient-to-br from-brand-primary/20 to-indigo-500/20 rounded-[3rem] mb-8 relative border border-white/5"
              >
                <Sparkles size={64} className="text-brand-primary" />
                <div className="absolute inset-0 bg-brand-primary/10 blur-[60px] -z-10 rounded-full" />
              </motion.div>
              <h3 className="text-4xl font-black text-white mb-4 tracking-tight text-gradient">
                {lang === 'en' ? 'AI Health Assistant' : 'AI சுகாதார உதவியாளர்'}
              </h3>
              <p className="text-slate-400 text-base leading-relaxed font-medium">
                {lang === 'en' 
                  ? 'Ask about symptoms, upload a health report, or describe your condition for supportive analysis.'
                  : 'அறிகுறிகளைப் பற்றி கேளுங்கள், சுகாதார அறிக்கையைப் பதிவேற்றுங்கள் அல்லது உங்கள் நிலையை விவரிக்கவும்.'}
              </p>
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {(lang === 'en' 
                  ? ['What is fever?', 'I have chest pain', 'Explain my health analysis']
                  : ['காய்ச்சல் என்றால் என்ன?', 'எனக்கு நெஞ்சு வலி உள்ளது', 'எனது சுகாதார அறிக்கையை விளக்குங்கள்']
                ).map(s => (
                  <button key={s} onClick={() => onSendMessage(s)}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:border-brand-primary/40 hover:text-white transition-all font-medium">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-brand-primary to-indigo-600 text-white' 
                    : 'bg-slate-800 text-brand-primary border border-white/10'
                }`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] space-y-3 ${msg.role === 'user' ? 'items-end flex flex-col' : 'flex-1'}`}>
                  <div className={`p-6 rounded-[2rem] shadow-xl transition-all ${
                    msg.role === 'user' 
                      ? 'chat-bubble-user text-white rounded-tr-none' 
                      : 'premium-glass text-slate-100 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-base max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>

                        {/* Bottom bar: Audio + NLP Toggle */}
                        <div className="mt-5 flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                          <button onClick={() => speak(msg.content, idx)}
                            className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-all flex-shrink-0">
                            {isSpeaking === idx ? <X size={18} /> : <Volume2 size={18} />}
                          </button>
                          <div className="flex-1 h-8 flex items-center gap-0.5">
                            {Array.from({length: 20}).map((_, i) => (
                              <motion.div key={i}
                                animate={isSpeaking === idx ? { height: [6, 28, 6] } : { height: 6 }}
                                transition={{ duration: 0.7 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.04 }}
                                className="w-0.5 bg-gradient-to-t from-brand-primary/30 to-brand-primary rounded-full"
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            {isSpeaking === idx 
                              ? (lang === 'en' ? 'Speaking...' : 'பேசுகிறது...') 
                              : (lang === 'en' ? 'HD Audio' : 'HD ஆடியோ')}
                          </span>
                          {/* Neural Processing Toggle */}
                          {(msg.analysis || msg.nlp_trace) && (
                            <button
                              onClick={() => {
                                setActiveAnalysis(msg.analysis || null);
                                setActiveNlpTrace(msg.nlp_trace || null);
                                setShowProcessPanel(prev => !(prev && activeAnalysis === msg.analysis));
                              }}
                              title="Toggle Neural Processing Panel"
                              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${
                                showProcessPanel && activeAnalysis === msg.analysis
                                  ? 'bg-brand-primary text-white border-brand-primary shadow-lg'
                                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-brand-primary/40 hover:text-brand-primary'
                              }`}
                            >
                              <Brain size={14} />
                              <span>NLP</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        {msg.preview && (
                          <div onClick={() => setSelectedDoc(msg.preview || null)}
                            className="w-44 h-28 rounded-xl border border-white/20 overflow-hidden cursor-zoom-in relative group">
                            <img src={msg.preview} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Doc" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Maximize2 className="text-white" size={20} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {msg.analysis && (
                    <div className="flex flex-col gap-2 pt-2">
                      {msg.analysis.specialty && (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Medical Specialty Detected:</span>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
                            <Stethoscope size={11} /> {msg.analysis.specialty}
                          </span>
                        </div>
                      )}
                      {msg.analysis.urgency && (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Urgency Level:</span>
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border ${
                            msg.analysis.urgency === 'high' 
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            <Activity size={11} /> {msg.analysis.urgency.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {msg.analysis.emotional_status && (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Patient Emotional Status:</span>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                            <BarChart3 size={11} /> {msg.analysis.emotional_status}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Charts */}
                  {msg.analysis?.entities?.length > 0 && (
                    <div className="w-full">
                      <Visualization entities={msg.analysis.entities}
                        type={['plot','graph','trend','chart'].some(k => msg.content.toLowerCase().includes(k)) ? 'line' : 'bar'} />
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          ))}

          {/* Loading dots */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/10">
                <Bot size={20} className="text-brand-primary animate-pulse" />
              </div>
              <div className="premium-glass p-4 rounded-[2rem] rounded-tl-none border border-white/5">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="p-5 pt-0">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 premium-glass rounded-[2rem] p-2 pl-5 border border-white/10 shadow-2xl focus-within:border-brand-primary/40 transition-all">
              <label className="p-2 text-slate-500 hover:text-brand-primary transition-all cursor-pointer rounded-xl hover:bg-white/5">
                <Paperclip size={20} />
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
              </label>
              <button type="button" onClick={onToggleLang}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/20 transition-all">
                <Sparkles size={12} />
                {lang === 'en' ? 'English' : 'தமிழ்'}
              </button>
              <input type="text" value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={lang === 'en' ? "Describe your symptoms..." : "உங்கள் அறிகுறிகளை விவரிக்கவும்..."}
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-600 text-base py-3 font-medium" />
              <button type="submit" disabled={!input.trim() || isLoading}
                className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all ${
                  input.trim() && !isLoading 
                    ? 'bg-gradient-to-br from-brand-primary to-indigo-600 text-white shadow-xl glow-primary' 
                    : 'bg-slate-800 text-slate-600'
                }`}>
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* === RIGHT: NLP Processing Panel === */}
      <AnimatePresence>
        {showProcessPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 420, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full flex-shrink-0 overflow-hidden border-l border-white/5 bg-slate-950/50 backdrop-blur-3xl"
          >
            <div className="w-[420px] h-full flex flex-col overflow-y-auto custom-scrollbar">
              {/* Panel Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
                    <Cpu size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Neural Processing</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">NLP Pipeline Trace</p>
                  </div>
                </div>
                <button onClick={() => setShowProcessPanel(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4 flex-1">
                {/* === LOADING: Live pipeline steps === */}
                {isLoading && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4">Live Pipeline Execution</p>
                    <AnimatePresence>
                      {processingSteps.map((step, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                          <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(59,130,246,0.8)] flex-shrink-0" />
                          <span className="text-sm text-slate-300 font-medium">{step}</span>
                          {i === processingSteps.length - 1 && (
                            <Loader2 size={13} className="animate-spin text-brand-primary ml-auto flex-shrink-0" />
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                      <Brain size={14} className="text-brand-primary animate-pulse" />
                      <span className="text-sm font-bold text-brand-primary">LLM Enrichment (20%)...</span>
                    </div>
                  </div>
                )}

                {/* === RESULT: Clinical Analysis (Primary 80%) === */}
                {!isLoading && activeAnalysis && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                      <ShieldCheck size={16} className="text-indigo-400" />
                      <span className="text-sm font-black text-indigo-400 uppercase tracking-tighter">Supportive Analysis Output</span>
                      <span className="ml-auto text-[10px] font-black text-slate-500 uppercase">Education Insight (80%)</span>
                    </div>
                    <ClinicalIntelligence analysis={activeAnalysis} />
                  </motion.div>
                )}

                {/* === RESULT: Neural Processing Trace (Background) === */}
                {!isLoading && activeNlpTrace && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-10 border-t border-white/5 mt-8">
                    
                    {/* Section Label */}
                    <div className="flex items-center gap-3 mb-2 px-2">
                      <Cpu size={20} className="text-emerald-400 opacity-50" />
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Pipeline Trace</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Intermediate Logic Layers</p>
                      </div>
                    </div>

                    {/* Token count */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center shadow-inner">
                        <p className="text-2xl font-black text-brand-primary">{activeNlpTrace.token_count}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Raw Tokens</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center shadow-inner">
                        <p className="text-2xl font-black text-indigo-400">{activeNlpTrace.meaningful_token_count}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Meaningful Tokens</p>
                      </div>
                    </div>

                    {/* Step 4: Medical Keywords (Moved up in sub-order for visibility) */}
                    <div className="space-y-2">
                      <p className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">1</span>
                        Model Understanding Context
                      </p>
                      {activeNlpTrace.medical_keywords_identified.length > 0 ? (
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-wrap gap-2">
                          {activeNlpTrace.medical_keywords_identified.map((t: string, i: number) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                              <Stethoscope size={11} /> {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                          <p className="text-xs text-slate-500 italic">No specific medical keywords detected — using general context.</p>
                        </div>
                      )}
                    </div>

                    {/* Step 1: Raw Tokens */}
                    <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                      <p className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-500/20 text-slate-400 flex items-center justify-center text-xs font-black">2</span>
                        Raw Tokenization
                      </p>
                      <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex flex-wrap gap-1.5">
                        {activeNlpTrace.raw_tokens.slice(0, 20).map((t: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-sm font-mono border border-white/5">{t}</span>
                        ))}
                      </div>
                    </div>

                    {/* Step 2: After Stopword Removal */}
                    <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                      <p className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-500/20 text-slate-400 flex items-center justify-center text-xs font-black">3</span>
                        Stopword Filtering
                      </p>
                      <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex flex-wrap gap-1.5">
                        {activeNlpTrace.after_stopword_removal.slice(0, 15).map((t: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-sm font-mono border border-white/5">{t}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Placeholder */}
                {!isLoading && !activeAnalysis && !activeNlpTrace && (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="p-6 rounded-[2rem] bg-white/3 border border-white/5">
                      <Brain size={36} className="text-slate-700" />
                    </div>
                    <p className="text-sm font-bold text-slate-600">Send a message to see<br/>the NLP pipeline trace here</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Doc fullscreen modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-10"
            onClick={() => setSelectedDoc(null)}>
            <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
              className="relative max-w-5xl max-h-full" onClick={e => e.stopPropagation()}>
              <img src={selectedDoc} className="rounded-[2rem] shadow-2xl border border-white/10 max-h-[85vh] object-contain" alt="Full Doc" />
              <button onClick={() => setSelectedDoc(null)}
                className="absolute -top-14 right-0 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all">
                <X size={28} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
