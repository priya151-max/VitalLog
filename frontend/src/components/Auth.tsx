import React, { useState } from 'react';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md p-8 rounded-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-primary/20">
            <LogIn className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">VitalLog</h1>
          <p className="text-slate-400 mt-2">Your Premium Medical Assistant</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full p-3 rounded-xl text-white mt-1"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full p-3 rounded-xl text-white mt-1"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm ml-1 animate-in">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />)}
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand-primary font-medium ml-2 hover:underline"
          >
            {isLogin ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
