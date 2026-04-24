import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { MedicalBot } from './components/MedicalBot';
import { Dashboard } from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, MessageSquareText, UserCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  analysis?: any;
}

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentConvId && messages.length === 0) {
      fetchHistory(currentConvId);
    } else if (!currentConvId) {
      setMessages([]);
    }
  }, [currentConvId]);

  const fetchHistory = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/history/${id}`);
      const data = await response.json();
      setMessages(data.history.map((m: any) => ({
        role: m.role,
        content: m.content,
        analysis: m.metadata
      })));
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const handleSendMessage = async (msg: string) => {
    let convId = currentConvId;
    if (!convId && session?.user) {
      const { data } = await supabase.from('conversations').insert({ 
        user_id: session.user.id, 
        title: msg.slice(0, 30) + '...' 
      }).select().single();
      if (data) {
        convId = data.id;
        setCurrentConvId(convId);
      }
    }

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, conversation_id: convId || "local-session", lang })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, analysis: data.analysis }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    let convId = currentConvId;
    if (!convId && session?.user) {
       const { data } = await supabase.from('conversations').insert({ 
         user_id: session.user.id, 
         title: `Report: ${file.name}` 
       }).select().single();
       if (data) { convId = data.id; setCurrentConvId(convId); }
    }
    setMessages(prev => [...prev, { role: 'user', content: `[Uploaded: ${file.name}]` }]);
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversation_id', convId || "local-session");
    formData.append('lang', lang);

    try {
      const response = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, analysis: data.analysis }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return <Auth onAuthSuccess={() => {}} />;

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-200">
      <Sidebar 
        currentId={currentConvId} 
        onSelect={(id) => { setMessages([]); setCurrentConvId(id); setActiveTab('chat'); }} 
        onNewChat={() => { setMessages([]); setCurrentConvId(null); setActiveTab('chat'); }} 
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Navigation Tabs */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl flex gap-1 shadow-2xl shadow-black/50">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'dashboard' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="font-bold text-sm tracking-wide">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'chat' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquareText size={18} />
            <span className="font-bold text-sm tracking-wide">Medical Bot</span>
          </button>
        </div>

        <div className="flex-1 pt-24 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full"
              >
                <Dashboard lang={lang} />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <MedicalBot 
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onUpload={handleFileUpload}
                  isLoading={loading}
                  lang={lang}
                  onToggleLang={() => setLang(l => l === 'en' ? 'ta' : 'en')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
