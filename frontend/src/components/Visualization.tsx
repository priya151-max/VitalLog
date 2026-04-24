import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

interface Entity {
  name: string;
  value: string;
}

export const Visualization: React.FC<{ entities: Entity[] }> = ({ entities }) => {
  if (!entities || entities.length === 0) return null;

  const data = entities.map(e => ({
    name: e.name.toUpperCase(),
    value: parseFloat(e.value) || 0,
    original: e.value
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <div className="glass-card p-4 rounded-2xl h-64">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Metrics Overview</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '12px' }}
              itemStyle={{ color: '#3b82f6' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center space-y-4 text-center">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Analysis Highlights</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {entities.map((e, i) => (
            <div key={i} className="bg-brand-primary/10 border border-brand-primary/20 px-4 py-2 rounded-full">
              <span className="text-xs text-slate-400 block uppercase font-bold">{e.name}</span>
              <span className="text-lg font-bold text-white">{e.value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 italic">Visual summary based on extracted report metrics.</p>
      </div>
    </div>
  );
};
