import React, { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { ComplexRoot } from '../types';

interface ComplexPlaneProps {
  roots: ComplexRoot[];
  title?: string;
}

const ComplexPlane: React.FC<ComplexPlaneProps> = ({ roots, title = "Plan Complexe (Argand)" }) => {
  
  // Determine domain to keep graph centered and readable
  const domain = useMemo(() => {
    if (roots.length === 0) return [-5, 5];
    
    const allVals = roots.flatMap(r => [r.real, r.imaginary]);
    const maxVal = Math.max(...allVals.map(Math.abs));
    const limit = Math.ceil(maxVal * 1.5) || 5; // Add padding
    return [-limit, limit];
  }, [roots]);

  const data = roots.map((root, index) => ({
    x: root.real,
    y: root.imaginary,
    z: 1, // Size factor
    name: root.label,
    color: root.color || '#0ea5e9', // Default to science-500
    source: root.sourceEquation
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { x, y, name, source } = payload[0].payload;
      return (
        <div className="bg-slate-800 p-3 border border-slate-700 shadow-xl rounded-lg text-sm z-50">
          {source && (
            <div className="mb-2 pb-2 border-b border-slate-700 font-mono text-xs text-slate-500">
              {source}
            </div>
          )}
          <p className="font-bold text-slate-200">{name}</p>
          <p className="text-slate-400">Re: {Number(x).toFixed(3)}</p>
          <p className="text-slate-400">Im: {Number(y).toFixed(3)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px] bg-slate-900 rounded-xl border border-slate-800 shadow-sm p-4 relative">
      <h3 className="absolute top-4 left-4 text-xs font-semibold text-slate-400 bg-slate-800/80 px-2 py-1 rounded backdrop-blur-sm z-10 border border-slate-700">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Re" 
            domain={domain} 
            allowDataOverflow={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            label={{ value: 'Re(z)', position: 'insideBottomRight', offset: -10, fill: '#64748b' }}
            stroke="#475569"
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Im" 
            domain={domain} 
            allowDataOverflow={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            label={{ value: 'Im(z)', position: 'insideTopLeft', offset: 10, fill: '#64748b' }}
            stroke="#475569"
          />
          
          {/* Main Axes */}
          <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
          <ReferenceLine x={0} stroke="#475569" strokeWidth={1} />

          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} />
          
          <Scatter name="Solutions" data={data}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} fillOpacity={0.6} strokeWidth={2} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComplexPlane;