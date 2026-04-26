import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Brain, Sparkles, Quote, BarChart2, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { EvaluationMetrics } from './EvaluationMetrics';

interface DashboardProps {
  lang: 'en' | 'ta';
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const Dashboard: React.FC<DashboardProps> = ({ lang }) => {
  const [data, setData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  useEffect(() => {
    const fetchData = () => {
      fetch(`${API_URL}/dashboard`)
        .then(res => res.json())
        .then(setData)
        .catch(console.error);

      fetch(`${API_URL}/analytics`)
        .then(res => res.json())
        .then(setAnalytics)
        .catch(console.error);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setActiveTipIndex(prev => (prev + 1) % 2);
    }, 10000);
    return () => clearInterval(tipInterval);
  }, []);

  if (!data) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      <p className="font-black uppercase tracking-widest text-[10px]">Initializing Real-time Analytics...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 overflow-y-auto h-full custom-scrollbar pb-24">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <h1 className="text-5xl font-black text-white mb-3 tracking-tighter text-gradient">
            {lang === 'en' ? 'Supportive Analysis' : 'ஆதரவு பகுப்பாய்வு'}
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            {lang === 'en' ? 'Real-time neural analysis of your medical records.' : 'உங்கள் மருத்துவ ஆவணங்களின் நிகழ்நேர நரம்பியல் பகுப்பாய்வு.'}
          </p>
        </div>
      </div>

      {/* Rotating Tips/Quotes Section */}
      <div className="h-56">
        <AnimatePresence mode="wait">
          {activeTipIndex === 0 ? (
            <motion.div 
              key="tip"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="premium-glass p-10 rounded-[3rem] relative overflow-hidden h-full flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-brand-primary/10"
            >
              <div className="absolute -top-12 -right-12 p-8 opacity-20 group-hover:rotate-12 transition-all">
                <Sparkles size={180} className="text-brand-primary animate-pulse" />
              </div>
              <div className="relative z-10 w-full">
                <div className="flex items-center gap-4 text-brand-primary mb-8">
                  <div className="p-3 bg-brand-primary/10 rounded-2xl">
                    <Brain size={36} />
                  </div>
                  <span className="font-black uppercase tracking-[0.4em] text-xs">Supportive Brain Insight</span>
                </div>
                <h2 className="text-3xl font-bold text-white leading-tight max-w-2xl">
                  {data.tip[lang]}
                </h2>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="quote"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="premium-glass p-10 rounded-[3rem] flex flex-col justify-center items-center text-center space-y-6 h-full border border-indigo-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
              <div className="p-6 rounded-[2.5rem] bg-indigo-500/10 text-indigo-400">
                <Quote size={48} />
              </div>
              <p className="text-2xl text-slate-200 italic font-medium max-w-3xl leading-relaxed">
                "{data.quote[lang]}"
              </p>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Inspiration Mode</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Analytics Section */}
      {analytics && (
        <div className="space-y-12 animate-in fade-in duration-1000">
          <div className="flex items-center gap-6">
            <div className="p-5 rounded-[2.5rem] bg-emerald-500/10 text-emerald-400">
              <BarChart2 size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tight">Supportive Neural Analytics</h2>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Advanced Pattern Recognition Analysis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Urgency Distribution */}
            <div className="premium-glass p-8 rounded-[3rem] border border-white/5 shadow-2xl relative group">
              <div className="absolute top-8 right-8">
                <Activity size={20} className="text-slate-700" />
              </div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
                Priority Distribution Matrix
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.urgency_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                      className="font-bold"
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      dx={-10}
                      className="font-bold"
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.03)'}}
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '20px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        padding: '12px 20px'
                      }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={40}>
                      {analytics.urgency_distribution.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index === 2 ? '#f43f5e' : index === 1 ? '#f59e0b' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Emotional Status */}
            <div className="premium-glass p-8 rounded-[3rem] border border-white/5 shadow-2xl relative">
              <div className="absolute top-8 right-8">
                <PieIcon size={20} className="text-slate-700" />
              </div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Patient Sentiment Vector</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.emotional_status}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="count"
                      stroke="none"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#f43f5e" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '20px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {analytics.emotional_status.map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-amber-500' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
                    <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Actionable Instructions */}
          <div className="premium-glass p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Actionable Directive Count</h3>
                <p className="text-slate-500 text-sm font-medium">Health suggestions detected in supportive analysis.</p>
              </div>
              <div className="text-right">
                <span className="text-6xl font-black text-brand-primary glow-primary tracking-tighter">
                  {analytics.instruction_trends?.[0]?.count.toString().padStart(2, '0') || '00'}
                </span>
              </div>
            </div>
            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden relative z-10 border border-white/5">
               <motion.div 
                className="h-full bg-gradient-to-r from-brand-primary to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (analytics.instruction_trends?.[0]?.count || 0) * 10)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
               />
            </div>
          </div>

          {/* Evaluation Metrics Integration */}
          <div className="border-t border-white/5 pt-12">
            <EvaluationMetrics />
          </div>
        </div>
      )}
    </div>
  );
};
