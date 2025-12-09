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
  ZAxis,
  Cell
} from 'recharts';
import { ComplexRoot } from '../types';

interface ComplexPlaneProps {
  roots: ComplexRoot[];
}

const ComplexPlane: React.FC<ComplexPlaneProps> = ({ roots }) => {
  
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
    name: root.label
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { x, y, name } = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
          <p className="font-bold text-slate-800">{name}</p>
          <p className="text-slate-600">Re: {x.toFixed(3)}</p>
          <p className="text-slate-600">Im: {y.toFixed(3)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px] bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative">
      <h3 className="absolute top-4 left-4 text-sm font-semibold text-slate-500 bg-white/80 px-2 py-1 rounded backdrop-blur-sm z-10">
        Plan Complexe (Argand)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Re" 
            domain={domain} 
            allowDataOverflow={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            label={{ value: 'Re(z)', position: 'insideBottomRight', offset: -10, fill: '#64748b' }}
            stroke="#94a3b8"
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Im" 
            domain={domain} 
            allowDataOverflow={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            label={{ value: 'Im(z)', position: 'insideTopLeft', offset: 10, fill: '#64748b' }}
            stroke="#94a3b8"
          />
          
          {/* Main Axes */}
          <ReferenceLine y={0} stroke="#475569" strokeWidth={2} />
          <ReferenceLine x={0} stroke="#475569" strokeWidth={2} />

          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          
          <Scatter name="Solutions" data={data}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#0ea5e9" stroke="#0284c7" strokeWidth={2} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComplexPlane;