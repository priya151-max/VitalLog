import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

interface SidebarProps {
  currentId: string | null;
  userId: string;
  refreshTrigger: number;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  profilePic?: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const Sidebar: React.FC<SidebarProps> = ({
  currentId, userId, refreshTrigger, onSelect, onNewChat, onDelete, profilePic
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [user, setUser] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/conversations/${userId}`);
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {
      setConversations([]);
    }
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, refreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
    fetchConversations();
  };

  return (
    <div className="w-80 h-full flex flex-col bg-slate-950/40 backdrop-blur-3xl relative z-40 border-r border-white/5">
      {/* Profile Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'vital'}`}
                className="w-10 h-10 rounded-full border-2 border-brand-primary/30 p-0.5 bg-slate-800"
                alt="Profile"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <p className="text-sm font-bold text-white truncate w-36">@{user?.email?.split('@')[0] || 'user'}</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">VitalLog Pro</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black text-white tracking-tight">Chats</h2>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
        {/* New Conversation Button */}
        <button
          onClick={onNewChat}
          className="w-full group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-primary/30 transition-all mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-all">
              <Plus size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white uppercase tracking-wider">New Conversation</p>
              <p className="text-[9px] text-slate-500 uppercase font-black">AI Health Brain</p>
            </div>
          </div>
        </button>

        <div className="space-y-1">
          <AnimatePresence>
            {conversations.map((conv, idx) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ delay: idx * 0.03 }}
                className={`w-full group text-left p-4 rounded-2xl flex items-center gap-3 transition-all border cursor-pointer ${
                  currentId === conv.id
                    ? 'bg-brand-primary/10 text-white border-brand-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                    : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-200'
                }`}
                onClick={() => onSelect(conv.id)}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  currentId === conv.id ? 'bg-brand-primary text-white shadow-lg' : 'bg-slate-800 text-slate-600'
                }`}>
                  <MessageSquare size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <span className={`truncate text-sm font-bold block ${currentId === conv.id ? 'text-white' : 'text-slate-300'}`}>
                    {conv.title}
                  </span>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Delete button — visible on hover */}
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  disabled={deletingId === conv.id}
                  className={`flex-shrink-0 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${
                    deletingId === conv.id
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-rose-500/20 hover:text-rose-400 text-slate-600'
                  }`}
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {conversations.length === 0 && (
            <div className="py-12 text-center">
              <MessageSquare size={32} className="text-slate-800 mx-auto mb-3" />
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Sign Out */}
      <div className="p-6 border-t border-white/5">
        <button
          onClick={async () => { 
            await supabase.auth.signOut(); 
            localStorage.removeItem('vitallog_user_id');
            window.location.reload(); 
          }}
          className="w-full flex items-center justify-center gap-4 p-4 rounded-2xl bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 transition-all text-[10px] font-black uppercase tracking-[0.2em] border border-rose-500/10"
        >
          End Session
        </button>
      </div>
    </div>
  );
};
