import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const VisualAnalytics = ({ result }) => {
  const scamScore = result?.scam_score || 0;
  const aiScore = result?.ai_score || 0;

  const scamData = [
    { name: 'Scam Risk', value: scamScore },
    { name: 'Neutral', value: 100 - scamScore },
  ];

  const aiData = [
    { name: 'AI Generation', value: aiScore },
    { name: 'Human Origin', value: 100 - aiScore },
  ];

  const COLORS_SCAM = [scamScore > 70 ? '#ef4444' : '#f59e0b', 'rgba(255, 255, 255, 0.05)'];
  const COLORS_AI = ['#6366f1', 'rgba(255, 255, 255, 0.05)'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-8">
      {/* Scam Heatmap Gauge */}
      <div className="bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[40px] border border-white/5 relative group overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 blur-[60px] rounded-full group-hover:bg-rose-500/20 transition-all" />
        
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#ef4444]" />
           Scam Prediction Engine
        </h3>

        <div className="relative h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={scamData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={0}
                dataKey="value"
                startAngle={225}
                endAngle={-45}
                stroke="none"
              >
                {scamData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS_SCAM[index % COLORS_SCAM.length]} 
                    className="transition-all duration-1000"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
            <span className={`text-4xl font-black font-mono tracking-tighter ${scamScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {scamScore}%
            </span>
            <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Certainty</span>
          </div>
        </div>
      </div>

      {/* AI Attribution Gauge */}
      <div className="bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[40px] border border-white/5 relative group overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-all" />
        
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
           Neural Origin Map
        </h3>

        <div className="relative h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={aiData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={0}
                dataKey="value"
                startAngle={225}
                endAngle={-45}
                stroke="none"
              >
                {aiData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS_AI[index % COLORS_AI.length]} 
                    className="transition-all duration-1000"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
            <span className="text-4xl font-black font-mono tracking-tighter text-indigo-400">
              {aiScore}%
            </span>
            <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">AI Content</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualAnalytics;
