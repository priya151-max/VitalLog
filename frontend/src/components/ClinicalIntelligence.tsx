import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ClipboardList, 
  Pill, 
  Smile, 
  Frown, 
  Meh,
  Activity,
  BarChart3,
  Stethoscope
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ClinicalAnalysisProps {
  analysis: {
    urgency?: string;
    instructions?: string[];
    negation_check?: Record<string, string>;
    medications?: Array<{ name: string; dosage: string }>;
    emotional_status?: string;
    specialty?: string;
    summary?: string;
  };
}

export const ClinicalIntelligence: React.FC<ClinicalAnalysisProps> = ({ analysis = {} }) => {
  // const urgency = analysis.urgency || 'low';
  const instructions = analysis.instructions || [];
  const negation_check = analysis.negation_check || {};
  const medications = analysis.medications || [];
  const emotional_status = analysis.emotional_status || 'Stable';

  const getUrgencyColor = (u: string) => {
    switch (u.toLowerCase()) {
      case 'high': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const getEmotionalIcon = (s: string) => {
    switch (s.toLowerCase()) {
      case 'distressed': return <Frown className="text-rose-400" size={24} />;
      case 'anxious': return <Meh className="text-amber-400" size={24} />;
      default: return <Smile className="text-emerald-400" size={24} />;
    }
  };

  // Prepare data for urgency chart
  const urgencyData = [
    { name: 'Low', value: 1, color: '#10b981' },
    { name: 'Medium', value: 2, color: '#f59e0b' },
    { name: 'High', value: 3, color: '#ef4444' },
  ];

  const currentUrgencyVal = (analysis.urgency || 'low').toLowerCase() === 'high' ? 3 : 
                           (analysis.urgency || 'low').toLowerCase() === 'medium' ? 2 : 1;

  return (
    <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
          <BarChart3 size={20} />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">Supportive Analysis Hub</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Urgency Triage */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Educational Priority</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={urgencyData}>
                <XAxis dataKey="name" hide />
                <YAxis hide domain={[0, 3]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {urgencyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      fillOpacity={entry.value === currentUrgencyVal ? 1 : 0.2}
                      stroke={entry.color}
                      strokeWidth={entry.value === currentUrgencyVal ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={`mt-2 text-center py-2 rounded-xl border font-bold text-sm ${getUrgencyColor(analysis.urgency || 'low')}`}>
            {(analysis.urgency || 'low').toUpperCase()} PRIORITY
          </div>
        </div>

        {/* 2. Patient Emotional Status */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Behavioral Status</span>
            <Activity size={16} className="text-blue-400" />
          </div>
          <div className="flex flex-col items-center justify-center flex-1 py-4">
            <div className="p-4 rounded-full bg-white/5 mb-3 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              {getEmotionalIcon(emotional_status)}
            </div>
            <span className="text-xl font-bold text-white drop-shadow-sm">{emotional_status}</span>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Tone Analysis</p>
          </div>
        </div>
      </div>

      {/* 3. Actionable Instructions */}
      <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={18} className="text-emerald-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Extracted Health Suggestions</span>
        </div>
        <div className="space-y-3">
          {instructions.length > 0 ? (
            instructions.map((inst, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                <p className="text-sm text-slate-200 leading-relaxed">{inst}</p>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-slate-500 italic">No specific instructions detected.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 4. Negation Check (Fact Check) */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} className="text-brand-primary" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Negation Analysis</span>
          </div>
          <div className="space-y-2">
            {Object.entries(negation_check).map(([cond, status], i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-sm font-medium text-slate-300 capitalize">{cond}</span>
                <div className="flex items-center gap-2">
                  {status.includes('Absent') ? (
                    <>
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded uppercase tracking-tighter">Absent</span>
                      <XCircle size={14} className="text-rose-400" />
                    </>
                  ) : status.includes('Present') ? (
                    <>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded uppercase tracking-tighter">Present</span>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    </>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded uppercase">Unknown</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Medication Extraction */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-4">
            <Pill size={18} className="text-purple-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medication Inventory</span>
          </div>
          <div className="space-y-2">
            {medications.length > 0 ? (
              medications.map((med, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{med.name}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Dosage Detected</span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-400 bg-purple-400/10 px-3 py-1 rounded-lg border border-purple-400/20">
                    {med.dosage}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-slate-500 opacity-50">
                <Stethoscope size={32} strokeWidth={1} className="mb-2" />
                <p className="text-xs">No medications found in text</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
