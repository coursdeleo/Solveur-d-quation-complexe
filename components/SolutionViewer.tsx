import React from 'react';
import { SolutionResponse } from '../types';
import ComplexPlane from './ComplexPlane';
import { BookOpen, CheckCircle, Activity } from 'lucide-react';

interface SolutionViewerProps {
  solution: SolutionResponse;
}

const SolutionViewer: React.FC<SolutionViewerProps> = ({ solution }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 fade-in">
      {/* Left Column: Visualization & Summary */}
      <div className="flex flex-col space-y-6">
        
        {/* Graph */}
        <ComplexPlane roots={solution.roots} />

        {/* Summary Card */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-indigo-900">Résultat Final</h3>
          </div>
          <div className="font-mono text-lg text-indigo-800 bg-white p-4 rounded-lg shadow-sm border border-indigo-100 break-words">
            {solution.latexSolution}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {solution.roots.map((root, idx) => (
               <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-indigo-600 border border-indigo-200">
                 {root.label} = {Number(root.real).toFixed(2)} {root.imaginary >= 0 ? '+' : ''} {Number(root.imaginary).toFixed(2)}i
               </span>
            ))}
          </div>
        </div>

        {/* Type Info */}
         <div className="flex items-center gap-3 text-slate-500 text-sm px-2">
            <Activity className="w-4 h-4" />
            <span>Type détecté : <span className="font-medium text-slate-700">{solution.equationType}</span></span>
        </div>
      </div>

      {/* Right Column: Step by Step */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Étapes de Résolution</h3>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {solution.explanationSteps.map((step, index) => (
            <div key={index} className="relative pl-6 pb-2 border-l-2 border-slate-100 last:border-0">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
              </div>
              <div className="text-slate-700 leading-relaxed text-sm md:text-base">
                {step.split('\n').map((line, i) => (
                    <p key={i} className={`mb-1 ${line.startsWith('**') ? 'font-bold text-slate-900 mt-2' : ''}`}>
                         {line.replace(/\*\*/g, '')}
                    </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SolutionViewer;