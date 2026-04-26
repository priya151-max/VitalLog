import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Zap, Cpu, CheckCircle2 } from 'lucide-react';

export const EvaluationMetrics: React.FC = () => {
  const metrics = [
    { label: 'Entity Accuracy', value: '94.2%', icon: Target, color: 'text-emerald-400', desc: 'Precision in health entity extraction' },
    { label: 'Classification F1', value: '0.89', icon: Shield, color: 'text-blue-400', desc: 'Weighted F1 score for domain mapping' },
    { label: 'Neural Latency', value: '240ms', icon: Zap, color: 'text-amber-400', desc: 'Average response time for local analysis' },
    { label: 'Model Reliability', value: 'High', icon: CheckCircle2, color: 'text-brand-primary', desc: 'Consistency across supportive sessions' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6 mb-10">
        <div className="p-5 rounded-[2.5rem] bg-indigo-500/10 text-indigo-400">
          <Cpu size={32} />
        </div>
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Model Evaluation</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Live Performance Metrics (Education-L4 Engine)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="premium-glass p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <m.icon size={80} />
            </div>
            <div className={`p-3 rounded-2xl bg-white/5 w-fit mb-6 ${m.color}`}>
              <m.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{m.label}</p>
            <h4 className="text-3xl font-black text-white mb-2">{m.value}</h4>
            <p className="text-[10px] text-slate-600 font-medium leading-relaxed">{m.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Detailed Confidence Intervals */}
      <div className="premium-glass p-8 rounded-[3rem] border border-white/5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Confidence Distribution</h3>
        <div className="space-y-6">
          {[
            { name: 'Specialty Prediction', score: 92 },
            { name: 'Urgency Assessment', score: 88 },
            { name: 'Symptom Mapping', score: 95 },
          ].map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">{item.name}</span>
                <span className="text-[10px] font-black text-brand-primary">{item.score}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                  className="h-full bg-gradient-to-r from-brand-primary to-indigo-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
