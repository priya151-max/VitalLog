import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Droplets, Thermometer, Brain, Sparkles, Quote, Calendar } from 'lucide-react';

interface DashboardProps {
  lang: 'en' | 'ta';
}

export const Dashboard: React.FC<DashboardProps> = ({ lang }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/dashboard')
      .then(res => res.json())
      .then(setData);
  }, []);

  const stats = [
    { label: lang === 'en' ? 'Blood Pressure' : 'இரத்த அழுத்தம்', value: '120/80', icon: Heart, color: 'text-rose-400' },
    { label: lang === 'en' ? 'Heart Rate' : 'இதய துடிப்பு', value: '72 bpm', icon: Activity, color: 'text-emerald-400' },
    { label: lang === 'en' ? 'Glucose' : 'சர்க்கரை அளவு', value: '95 mg/dL', icon: Droplets, color: 'text-blue-400' },
    { label: lang === 'en' ? 'Temperature' : 'வெப்பநிலை', value: '98.6°F', icon: Thermometer, color: 'text-orange-400' },
  ];

  if (!data) return <div className="h-full flex items-center justify-center text-white">Loading Dashboard...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto h-full custom-scrollbar">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {lang === 'en' ? 'Your Health Overview' : 'உங்கள் சுகாதார மேலோட்டம்'}
          </h1>
          <p className="text-slate-400">
            {lang === 'en' ? 'Welcome back! Here is your latest vitals.' : 'மீண்டும் வருக! உங்கள் சமீபத்திய உடல்நிலை இதோ.'}
          </p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
          <Calendar className="text-brand-primary" />
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Last Checkup</p>
            <p className="text-white font-medium">{data.metrics_summary.last_checkup}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 rounded-3xl border border-white/10 hover:border-brand-primary/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">Normal</span>
            </div>
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Health Tip Card */}
        <motion.div 
          className="lg:col-span-2 glass-card p-8 rounded-[2rem] relative overflow-hidden group"
          whileHover={{ scale: 1.01 }}
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles size={120} className="text-brand-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-brand-primary mb-6">
              <Brain size={28} />
              <span className="font-bold uppercase tracking-[0.2em] text-sm">Tip of the Day</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              {data.tip[lang]}
            </h2>
            <button className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-brand-primary/20 transition-all">
              Learn More
            </button>
          </div>
        </motion.div>

        {/* Health Quote Card */}
        <motion.div 
          className="glass-card p-8 rounded-[2rem] flex flex-col justify-center items-center text-center space-y-6"
          whileHover={{ scale: 1.01 }}
        >
          <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400">
            <Quote size={32} />
          </div>
          <p className="text-xl text-slate-300 italic font-medium leading-relaxed">
            "{data.quote[lang]}"
          </p>
          <div className="w-12 h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Inspiration</p>
        </motion.div>
      </div>
    </div>
  );
};
