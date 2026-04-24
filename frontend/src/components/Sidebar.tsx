import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, History, LogOut, Settings } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

interface SidebarProps {
  currentId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentId, onSelect, onNewChat }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) setConversations(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="w-80 h-full border-r border-white/10 flex flex-col bg-slate-950/50 backdrop-blur-xl">
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-brand-primary/10 border border-brand-primary/20 hover:bg-brand-primary/20 text-brand-primary py-3 rounded-xl transition-all mb-4"
        >
          <Plus size={18} />
          <span className="font-semibold">New Consultation</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 px-2">
          <History size={14} />
          Recent Analysis
        </div>
        
        <div className="space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                currentId === conv.id 
                  ? 'bg-brand-primary/20 text-white border border-brand-primary/30' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <MessageSquare size={16} className={currentId === conv.id ? 'text-brand-primary' : ''} />
              <span className="truncate text-sm font-medium">{conv.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/10 space-y-2">
        <button className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-white/5 transition-all text-sm font-medium">
          <Settings size={18} />
          Settings
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};
