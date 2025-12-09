import React, { useState } from 'react';
import { solveComplexEquation } from './services/geminiService';
import { SolutionResponse, Example } from './types';
import SolutionViewer from './components/SolutionViewer';
import { Calculator, ArrowRight, Loader2, Info, X, Activity, BookOpen, GraduationCap, Github } from 'lucide-react';

const EXAMPLES: Example[] = [
  { label: "Second degré réel", equation: "z^2 + z + 1 = 0" },
  { label: "Bicarrée", equation: "z^4 - 1 = 0" },
  { label: "Troisième degré", equation: "z^3 - 8 = 0" },
  { label: "Système simple", equation: "2z + 3i = 4 - z" },
];

const Modal = ({ isOpen, onClose, title, icon: Icon, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800">
            {Icon && <Icon className="w-5 h-5 text-science-600" />}
            <h3 className="font-semibold">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar text-slate-600 space-y-4">
          {children}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors text-slate-700">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [solution, setSolution] = useState<SolutionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation State
  const [activeModal, setActiveModal] = useState<'theory' | 'about' | null>(null);

  const handleSolve = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setSolution(null);

    try {
      const result = await solveComplexEquation(input);
      setSolution(result);
    } catch (err: any) {
      setError(err.message || "Une erreur inconnue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (eq: string) => {
    setInput(eq);
    const form = document.getElementById('solve-form');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const scrollToExamples = () => {
    const el = document.getElementById('examples-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Modals */}
      <Modal 
        isOpen={activeModal === 'theory'} 
        onClose={() => setActiveModal(null)}
        title="Rappel Théorique"
        icon={GraduationCap}
      >
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            <strong>Nombres Complexes :</strong> Un nombre complexe est de la forme <code className="bg-slate-100 px-1 py-0.5 rounded text-science-700">z = a + bi</code>, où <code className="font-mono">a</code> est la partie réelle et <code className="font-mono">b</code> la partie imaginaire.
          </p>
          <div className="p-3 bg-science-50 rounded-lg border border-science-100">
            <h4 className="font-semibold text-science-800 mb-1">Équation du second degré</h4>
            <p className="mb-2">Pour <code className="font-mono">az² + bz + c = 0</code>, on calcule le discriminant <code className="font-mono">Δ = b² - 4ac</code>.</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Si <code className="font-mono">Δ &gt; 0</code> : deux solutions réelles.</li>
              <li>Si <code className="font-mono">Δ = 0</code> : une solution réelle double.</li>
              <li>Si <code className="font-mono">Δ &lt; 0</code> : deux solutions complexes conjuguées <code className="font-mono">(-b ± i√|Δ|) / 2a</code>.</li>
            </ul>
          </div>
          <p>
            <strong>Forme Exponentielle :</strong> Utile pour les racines n-ièmes. <code className="bg-slate-100 px-1 py-0.5 rounded text-science-700">z = r·e^(iθ)</code>.
          </p>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'about'} 
        onClose={() => setActiveModal(null)}
        title="À Propos"
        icon={Info}
      >
        <p>
          <strong>Solveur Complexe</strong> est une application éducative conçue pour aider les étudiants et les passionnés de mathématiques à visualiser et résoudre des équations dans l'ensemble des nombres complexes ℂ.
        </p>
        <p className="mt-4">
          <strong>Technologie :</strong> L'application utilise l'intelligence artificielle <strong>Google Gemini</strong> pour analyser l'équation, déterminer la meilleure méthode de résolution pas à pas, et extraire les racines pour la visualisation.
        </p>
        <div className="mt-6 flex items-center justify-center">
           <span className="text-xs text-slate-400">Version 1.0.0 • Propulsé par React & Gemini Flash</span>
        </div>
      </Modal>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 bg-science-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-science-200">
              <span className="font-mono font-bold text-lg">i</span>
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">Solveur<span className="text-science-600">Complexe</span></h1>
          </div>
          <nav className="hidden md:flex gap-1 bg-slate-50/50 p-1 rounded-full border border-slate-200/50">
            <button 
              onClick={() => setActiveModal('theory')}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:text-science-600 hover:bg-white hover:shadow-sm transition-all"
            >
              Théorie
            </button>
            <button 
              onClick={scrollToExamples}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:text-science-600 hover:bg-white hover:shadow-sm transition-all"
            >
              Exemples
            </button>
            <button 
              onClick={() => setActiveModal('about')}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:text-science-600 hover:bg-white hover:shadow-sm transition-all"
            >
              À propos
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Hero / Input Section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Résolvez vos équations dans <span className="font-serif italic text-science-600 font-medium">C</span>
          </h2>
          <p className="text-slate-600 mb-8 text-lg">
            Entrez une équation polynomiale ou algébrique. L'IA calculera les racines, fournira les étapes détaillées et tracera le graphique.
          </p>

          <form id="solve-form" onSubmit={handleSolve} className="relative max-w-xl mx-auto z-10">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calculator className="h-5 w-5 text-slate-400 group-focus-within:text-science-500 transition-colors" />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ex: z^2 + 2z + 2 = 0"
                className="block w-full pl-11 pr-14 py-4 bg-white border-2 border-slate-200 rounded-2xl text-lg font-mono placeholder:font-sans placeholder:text-slate-400 focus:border-science-500 focus:ring-4 focus:ring-science-100 transition-all outline-none shadow-sm group-hover:border-slate-300"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 bg-science-600 hover:bg-science-700 text-white rounded-xl px-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-science-600/20 active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </form>

          {/* Examples Pills */}
          <div id="examples-section" className="mt-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Essayer un exemple</span>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => loadExample(ex.equation)}
                  className="bg-white border border-slate-200 hover:border-science-400 hover:bg-science-50 hover:text-science-700 text-slate-600 text-sm px-4 py-2 rounded-full transition-all shadow-sm"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-bottom-4">
            <X className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Erreur</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Results Area */}
        {solution && (
           <SolutionViewer solution={solution} />
        )}

        {/* Empty State / Instructional */}
        {!solution && !loading && !error && (
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center opacity-70 max-w-5xl mx-auto">
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-500">
                <span className="font-serif italic font-bold text-xl">z</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Analyse Intelligente</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Reconnaissance automatique du type d'équation (polynomiale, système, etc.) et choix de la méthode optimale.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Explications Claires</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Détails pédagogiques étape par étape, expliquant le calcul du discriminant, la forme polaire, etc.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-amber-500">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Visualisation Graphique</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Placement automatique des racines calculées sur un plan d'Argand interactif.</p>
            </div>
          </div>
        )}

      </main>

      <footer className="bg-white border-t border-slate-200 py-10 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-mono font-bold text-xl">i</div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Solveur Complexe. <br/>
            Une démo interactive utilisant l'API Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;