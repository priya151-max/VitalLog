import React from 'react';
import { motion } from 'framer-motion';
import { X, Info, ChevronDown, User, Plus } from 'lucide-react';

interface SettingsPanelProps {
  settings: {
    outputStyle: string;
    outputLength: number;
    sentiment: string;
    learningRate: number;
    profilePic: string | null;
  };
  setSettings: (s: any) => void;
  onClose?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings, onClose }) => {
  const styles = ['Paragraph', 'Numbered List', 'Essay', 'Titles', 'Summary', 'Speech'];

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-96 h-full premium-glass border-l border-white/10 flex flex-col overflow-hidden"
    >
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-tight">Response Tuning</h2>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <X size={20} className="text-slate-400" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
        {/* Output Settings */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Output Format</h3>
            <ChevronDown size={14} className="text-slate-700" />
          </div>
          
          <div className="space-y-8">
            <div>
              <p className="text-[9px] text-slate-600 uppercase font-black mb-4 flex items-center gap-2">
                Structural Template <Info size={10} />
              </p>
              <div className="grid grid-cols-2 gap-2">
                {styles.map(style => (
                  <button
                    key={style}
                    onClick={() => setSettings({ ...settings, outputStyle: style.toLowerCase() })}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      settings.outputStyle === style.toLowerCase()
                        ? 'bg-brand-primary text-white border-brand-primary glow-primary'
                        : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-4">
                <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Token Limit (Length)</p>
                <span className="text-[10px] text-brand-primary font-black">{settings.outputLength}px</span>
              </div>
              <div className="relative h-6 flex items-center">
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={settings.outputLength}
                  onChange={(e) => setSettings({ ...settings, outputLength: parseInt(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-brand-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Profile Customization */}
        <section className="border-t border-white/5 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Identity Profile</h3>
            <User size={14} className="text-slate-700" />
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5">
              <div className="relative">
                <img 
                  src={settings.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=vital`} 
                  className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10"
                  alt="Current Profile"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Avatar Selection</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Neural Persona</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setSettings({ ...settings, profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' })}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-primary/30 transition-all"
              >
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-10 h-10 rounded-lg" alt="Male" />
                <span className="text-[9px] font-black text-slate-500 uppercase">Male</span>
              </button>
              <button 
                onClick={() => setSettings({ ...settings, profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' })}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-primary/30 transition-all"
              >
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" className="w-10 h-10 rounded-lg" alt="Female" />
                <span className="text-[9px] font-black text-slate-500 uppercase">Female</span>
              </button>
              <label className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-primary/30 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                  <Plus size={20} />
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase">Custom</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setSettings({ ...settings, profilePic: reader.result as string });
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </section>

        <div className="p-8 mt-12 rounded-[2rem] bg-brand-primary/5 border border-brand-primary/10 text-center">
          <p className="text-[9px] text-brand-primary font-black uppercase tracking-[0.4em] mb-2">Engine Version</p>
          <p className="text-xl font-black text-white tracking-tighter">Clinical-L4 Neural</p>
        </div>
      </div>

      <div className="p-6 border-t border-white/10 bg-slate-950/40">
        <button className="w-full flex items-center justify-center gap-3 bg-brand-primary text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all glow-primary shadow-2xl shadow-brand-primary/20">
          Apply Configuration
        </button>
      </div>
    </motion.div>
  );
};
