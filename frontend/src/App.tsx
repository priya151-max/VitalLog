import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { MedicalBot } from './components/MedicalBot';
import { Dashboard } from './components/Dashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { BackgroundMotion } from './components/BackgroundMotion';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, MessageSquareText, Settings } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  analysis?: any;
  nlp_trace?: any;
  preview?: string;
}

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [localUserId, setLocalUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('chat');
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);

  const [settings, setSettings] = useState({
    outputStyle: 'paragraph',
    outputLength: 800,
    sentiment: 'positive',
    learningRate: 0.4,
    profilePic: null as string | null
  });
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        syncUser(session.user.email);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user?.email) {
        syncUser(s.user.email);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const syncUser = async (email: string) => {
    try {
      const response = await fetch(`${API_URL}/user/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      setLocalUserId(data.user_id);
      localStorage.setItem('vitallog_user_id', data.user_id);
    } catch (err) {
      console.error('User sync failed:', err);
    }
  };

  // Load history when conversation changes
  useEffect(() => {
    if (currentConvId) {
      setMessages([]);
      fetchHistory(currentConvId);
    } else {
      setMessages([]);
    }
  }, [currentConvId]);

  const fetchHistory = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/history/${id}`);
      const data = await response.json();
      if (data.history && data.history.length > 0) {
        const mapped: Message[] = data.history.map((m: any) => {
          // Backward compatibility for metadata structure
          const meta = m.metadata || {};
          const analysis = meta.analysis || (meta.specialty ? meta : null);
          const trace = meta.nlp_trace || null;
          
          return {
            role: m.role,
            content: m.content,
            analysis: analysis,
            nlp_trace: trace
          };
        });
        setMessages(mapped);
        localStorage.setItem(`chat_${id}`, JSON.stringify(mapped));
      } else {
        // Fallback to localStorage cache
        const cached = localStorage.getItem(`chat_${id}`);
        if (cached) setMessages(JSON.parse(cached));
      }
    } catch {
      const cached = localStorage.getItem(`chat_${id}`);
      if (cached) setMessages(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  const ensureConversation = async (title: string): Promise<string> => {
    if (currentConvId) return currentConvId;

    const uid = localUserId || 'anonymous';
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uid, title })
      });
      const data = await res.json();
      setCurrentConvId(data.id);
      setSidebarRefresh(n => n + 1);
      return data.id;
    } catch {
      return 'local-' + Date.now();
    }
  };

  const handleSendMessage = async (msg: string) => {
    const convId = await ensureConversation(msg.slice(0, 40) + '...');

    const userMsg: Message = { role: 'user', content: msg };
    setMessages(prev => {
      const next = [...prev, userMsg];
      localStorage.setItem(`chat_${convId}`, JSON.stringify(next));
      return next;
    });
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          conversation_id: convId,
          user_id: localUserId || 'anonymous',
          lang,
          ...settings
        })
      });
      const data = await response.json();
      const botMsg: Message = {
        role: 'assistant',
        content: data.reply,
        analysis: data.analysis,
        nlp_trace: data.nlp_trace
      };
      setMessages(prev => {
        const next = [...prev, botMsg];
        localStorage.setItem(`chat_${convId}`, JSON.stringify(next));
        return next;
      });
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const convId = await ensureConversation(`Report: ${file.name}`);

    const reader = new FileReader();
    reader.onload = async () => {
      const preview = file.type.startsWith('image/') ? reader.result as string : undefined;
      const userMsg: Message = { role: 'user', content: `[Uploaded: ${file.name}]`, preview };
      setMessages(prev => {
        const next = [...prev, userMsg];
        localStorage.setItem(`chat_${convId}`, JSON.stringify(next));
        return next;
      });
      setLoading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversation_id', convId);
      formData.append('lang', lang);
      formData.append('user_id', localUserId || 'anonymous');

      try {
        const response = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
        const data = await response.json();
        const botMsg: Message = {
          role: 'assistant',
          content: data.reply,
          analysis: data.analysis,
          nlp_trace: data.nlp_trace
        };
        setMessages(prev => {
          const next = [...prev, botMsg];
          localStorage.setItem(`chat_${convId}`, JSON.stringify(next));
          return next;
        });
      } catch (err: any) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Upload error: ${err.message}` }]);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await fetch(`${API_URL}/conversations/${id}`, { method: 'DELETE' });
      localStorage.removeItem(`chat_${id}`);
      if (currentConvId === id) {
        setCurrentConvId(null);
        setMessages([]);
      }
      setSidebarRefresh(n => n + 1);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0b0e14] overflow-hidden font-sans text-slate-200 selection:bg-brand-primary/30">
      {!session ? (
        <Auth onAuthSuccess={() => {}} />
      ) : (
        <>
          <BackgroundMotion />

          <Sidebar
            currentId={currentConvId}
            userId={localUserId || 'anonymous'}
            refreshTrigger={sidebarRefresh}
            onSelect={(id) => { setCurrentConvId(id); setActiveTab('chat'); }}
            onNewChat={() => { setMessages([]); setCurrentConvId(null); setActiveTab('chat'); }}
            onDelete={handleDeleteConversation}
            profilePic={settings.profilePic}
          />

          <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Navigation */}
        <div className="p-6 flex items-center justify-between">
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-1 rounded-2xl flex gap-1 shadow-2xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-brand-primary text-white shadow-lg glow-primary'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <LayoutDashboard size={16} />
              <span className="font-bold text-xs uppercase tracking-widest">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'chat'
                  ? 'bg-brand-primary text-white shadow-lg glow-primary'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <MessageSquareText size={16} />
              <span className="font-bold text-xs uppercase tracking-widest">Assistant</span>
            </button>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-xl border transition-all ${
              showSettings
                ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }} className="h-full">
                <Dashboard lang={lang} />
              </motion.div>
            ) : (
              <motion.div key="chat"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} className="h-full">
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
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel settings={settings} setSettings={setSettings} onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </>
  )}
</div>
  );
};

export default App;
