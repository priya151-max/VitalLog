import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';

interface Entity {
  name: string;
  value: string;
  trend?: number[]; // Added for line charts
}

export const Visualization: React.FC<{ entities: Entity[], type?: 'bar' | 'line' | 'pie' }> = ({ entities, type = 'bar' }) => {
  if (!entities || entities.length === 0) return null;

  const data = entities.map(e => ({
    name: e.name.toUpperCase(),
    value: parseFloat(e.value) || 0,
    original: e.value,
    trend: e.trend || [parseFloat(e.value) * 0.8, parseFloat(e.value) * 1.1, parseFloat(e.value) * 0.9, parseFloat(e.value)]
  }));

  const renderChart = () => {
    if (type === 'line') {
      // Flatten trend data for plotting
      const trendData = data[0].trend.map((v, i) => ({ step: i, value: v }));
      return (
        <AreaChart data={trendData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis dataKey="step" hide />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
          />
          <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
        </AreaChart>
      );
    }

    return (
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip 
          cursor={{fill: 'rgba(255,255,255,0.02)'}}
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
          itemStyle={{ color: '#3b82f6' }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={30}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
          ))}
        </Bar>
      </BarChart>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8"
    >
      <div className="premium-glass p-6 rounded-[2rem] h-72 border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <BarChart2 size={120} className="text-white" />
        </div>
        <h3 className="text-[10px] font-black text-slate-500 mb-6 uppercase tracking-[0.3em] flex items-center gap-2">
          Metric Vector Analysis
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      <div className="premium-glass p-8 rounded-[3rem] flex flex-col items-center justify-center space-y-6 text-center border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-brand-primary/10 blur-[60px] rounded-full" />
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Extracted Neural Entities</h3>
        <div className="flex flex-wrap gap-3 justify-center">
          {entities.map((e, i) => (
            <div key={i} className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl group hover:border-brand-primary/50 transition-all shadow-lg">
              <span className="text-[9px] text-slate-500 block uppercase font-black tracking-widest mb-1">{e.name}</span>
              <span className="text-xl font-black text-white group-hover:text-brand-primary transition-all">{e.value}</span>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic">Computed based on diagnostic extraction protocol</p>
      </div>
    </motion.div>
  );
};

import { BarChart2 } from 'lucide-react';
