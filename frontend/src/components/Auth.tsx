import React, { useState } from 'react';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Loader2, Shield } from 'lucide-react';

export const Auth: React.FC<{ onAuthSuccess: () => void }> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for confirmation!');
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="premium-card w-full max-w-md p-12 rounded-[2.5rem] relative z-10 transition-all duration-500 hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] hover:border-blue-500/30 group"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 group-hover:opacity-70 transition-opacity" />
            <div className="relative w-16 h-16 bg-[#3b82f6] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
              <Shield className="text-white w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            VitalLog <span className="text-[#3b82f6]">Pro</span>
          </h1>
          
          <motion.p 
            animate={{ 
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : -10,
              height: isHovered ? 'auto' : 0
            }}
            className="text-[#64748b] mt-2 font-semibold uppercase tracking-[0.25em] text-[10px] overflow-hidden"
          >
            Next-Gen Clinical Intelligence
          </motion.p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="premium-input w-full px-4 py-3.5 rounded-xl text-white placeholder-slate-600"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="premium-input w-full px-4 py-3.5 rounded-xl text-white placeholder-slate-600"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs ml-1">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <>
                {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                <span className="text-sm uppercase tracking-widest">{isLogin ? 'Sign In' : 'Sign Up'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-slate-500 text-[11px] font-medium tracking-wide">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#3b82f6] font-bold ml-2 hover:underline"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>

          <motion.p 
            animate={{ 
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 10,
              height: isHovered ? 'auto' : 0
            }}
            className="text-[9px] text-slate-700 text-center font-bold uppercase tracking-[0.15em] leading-relaxed max-w-[220px] overflow-hidden"
          >
            Sign in to sync your data across devices and access premium features.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};
