import React, { useState, useEffect, useMemo } from 'react';
import { solveComplexEquation } from './services/geminiService';
import { SolutionResponse, Example, HistoryItem, ComplexRoot } from './types';
import SolutionViewer from './components/SolutionViewer';
import ComplexPlane from './components/ComplexPlane';
import { Calculator, ArrowRight, Loader2, Info, X, Activity, BookOpen, GraduationCap, Library, History, Trash2 } from 'lucide-react';

const EXAMPLES: Example[] = [
  { label: "Second degré réel", equation: "z^2 + z + 1 = 0" },
  { label: "Bicarrée", equation: "z^4 - 1 = 0" },
  { label: "Troisième degré", equation: "z^3 - 8 = 0" },
  { label: "Système simple", equation: "2z + 3i = 4 - z" },
];

const HISTORY_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#f43f5e', // Rose
];

const Modal = ({ isOpen, onClose, title, icon: Icon, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2 text-slate-100">
            {Icon && <Icon className="w-5 h-5 text-science-500" />}
            <h3 className="font-semibold">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar text-slate-300 space-y-4">
          {children}
        </div>
        <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors text-slate-200">
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
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Navigation State
  const [activeModal, setActiveModal] = useState<'theory' | 'about' | 'tutorials' | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('complex_solver_history');
      if (savedHistory) {
        const parsed: HistoryItem[] = JSON.parse(savedHistory);
        // Filter items older than 30 days
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const validHistory = parsed.filter(item => item.timestamp > thirtyDaysAgo);
        
        // Update local storage if we filtered anything
        if (validHistory.length !== parsed.length) {
          localStorage.setItem('complex_solver_history', JSON.stringify(validHistory));
        }
        setHistory(validHistory);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const addToHistory = (eq: string, sol: SolutionResponse) => {
    // Check if duplicate (same equation recently)
    const exists = history.find(h => h.equation === eq);
    if (exists) return; // Optional: update timestamp instead?

    const newColor = HISTORY_COLORS[history.length % HISTORY_COLORS.length];
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      equation: eq,
      solution: sol,
      color: newColor
    };

    const newHistory = [newItem, ...history];
    setHistory(newHistory);
    localStorage.setItem('complex_solver_history', JSON.stringify(newHistory));
  };

  const purgeHistory = () => {
    if (window.confirm("Voulez-vous vraiment effacer tout l'historique des calculs ?")) {
      setHistory([]);
      localStorage.removeItem('complex_solver_history');
    }
  };

  const handleSolve = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setSolution(null);

    try {
      const result = await solveComplexEquation(input);
      setSolution(result);
      addToHistory(input, result);
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

  const scrollToHistory = () => {
    const el = document.getElementById('history-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Aggregate all roots from history for the global graph
  const allHistoryRoots = useMemo(() => {
    let allRoots: ComplexRoot[] = [];
    history.forEach(item => {
      const itemRoots = item.solution.roots.map(root => ({
        ...root,
        color: item.color,
        sourceEquation: item.equation
      }));
      allRoots = [...allRoots, ...itemRoots];
    });
    return allRoots;
  }, [history]);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-science-500/30">
      
      {/* Modals */}
      <Modal 
        isOpen={activeModal === 'theory'} 
        onClose={() => setActiveModal(null)}
        title="Rappel Théorique"
        icon={GraduationCap}
      >
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            <strong>Nombres Complexes :</strong> Un nombre complexe est de la forme <code className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-science-400">z = a + bi</code>, où <code className="font-mono text-slate-200">a</code> est la partie réelle et <code className="font-mono text-slate-200">b</code> la partie imaginaire.
          </p>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <h4 className="font-semibold text-science-400 mb-2">Modules et Arguments</h4>
            <p className="mb-2">Le module <code className="font-mono text-slate-200">|z| = √(a² + b²)</code> représente la distance à l'origine.</p>
            <p>L'argument représente l'angle avec l'axe réel.</p>
          </div>
          <p>
            <strong>Forme Exponentielle :</strong> Utile pour les racines n-ièmes. <code className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-science-400">z = r·e^(iθ)</code>.
          </p>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'tutorials'} 
        onClose={() => setActiveModal(null)}
        title="Tutoriels de Résolution"
        icon={Library}
      >
        <div className="space-y-8 text-sm leading-relaxed">
          {/* Section 1: Équations avec Conjugué */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-science-400 flex items-center gap-2">
              1. Équations avec Conjugué (<span className="font-mono italic text-white">z</span> et <span className="font-mono italic text-white">z̄</span>)
            </h4>
            <p className="text-slate-400">
              Ces équations contiennent à la fois <code className="text-slate-200">z</code> et son conjugué <code className="text-slate-200">z̄</code> (ex: <code className="text-xs bg-slate-800 p-1 rounded">2z + i z̄ = 5</code>). On ne peut pas isoler z directement.
            </p>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
              <p className="font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-2">La Méthode Algébrique :</p>
              <ol className="list-decimal pl-4 space-y-2 text-slate-300">
                <li>
                  Poser <code className="text-science-300 font-mono">z = x + iy</code> (avec x, y réels).
                </li>
                <li>
                  Remplacer dans l'équation. Sachant que <code className="text-science-300 font-mono">z̄ = x - iy</code>.
                </li>
                <li>
                  Développer et regrouper les parties réelles et imaginaires.
                </li>
                <li>
                  Identifier : <span className="text-emerald-400">Re(gauche) = Re(droite)</span> et <span className="text-amber-400">Im(gauche) = Im(droite)</span>.
                </li>
                <li>
                  Résoudre le système de 2 équations à 2 inconnues (x et y).
                </li>
              </ol>
            </div>
          </div>
          <div className="w-full h-px bg-slate-800"></div>
          {/* Section 2: Second Degré */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-science-400 flex items-center gap-2">
              2. Second Degré dans ℂ
            </h4>
            <p className="text-slate-400">
              Pour une équation de la forme <code className="text-slate-200 font-mono">az² + bz + c = 0</code>.
            </p>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
              <p className="font-semibold text-slate-200">1. Calculer le discriminant :</p>
              <div className="text-center py-2 font-mono text-xl text-science-300 bg-slate-900 rounded border border-slate-800">
                Δ = b² - 4ac
              </div>
              <p className="font-semibold text-slate-200 mt-2">2. Selon le signe de Δ :</p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex gap-2">
                  <span className="font-mono text-emerald-400 whitespace-nowrap">Si Δ &gt; 0 :</span>
                  <span>Deux solutions réelles classiques.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-emerald-400 whitespace-nowrap">Si Δ = 0 :</span>
                  <span>Une solution unique <code className="font-mono text-slate-200">z = -b / 2a</code>.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-emerald-400 whitespace-nowrap">Si Δ &lt; 0 :</span>
                  <span>
                    Deux solutions complexes conjuguées. On pose <code className="font-mono">δ² = Δ</code> (avec des i). Les solutions sont :
                    <div className="mt-2 text-center font-mono text-science-200">
                      z₁ = (-b - i√|Δ|) / 2a <br/>
                      z₂ = (-b + i√|Δ|) / 2a
                    </div>
                  </span>
                </li>
              </ul>
            </div>
          </div>
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
           <span className="text-xs text-slate-500">Version 1.1.0 • Propulsé par React & Gemini Flash</span>
        </div>
      </Modal>

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 bg-science-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-science-900/50">
              <span className="font-mono font-bold text-lg">i</span>
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-100">Solveur<span className="text-science-500">Complexe</span></h1>
          </div>
          <nav className="hidden md:flex gap-1 bg-slate-800/50 p-1 rounded-full border border-slate-700/50">
            <button 
              onClick={() => setActiveModal('theory')}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            >
              Théorie
            </button>
            <button 
              onClick={() => setActiveModal('tutorials')}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1.5"
            >
              Tutoriels
            </button>
            <button 
              onClick={scrollToExamples}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            >
              Exemples
            </button>
            {history.length > 0 && (
              <button 
                onClick={scrollToHistory}
                className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5" />
                Historique
              </button>
            )}
            <button 
              onClick={() => setActiveModal('about')}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            >
              À propos
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Hero / Input Section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4 tracking-tight">
            Résolvez vos équations dans <span className="font-serif italic text-science-500 font-medium">C</span>
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            Entrez une équation polynomiale ou algébrique. L'IA calculera les racines, fournira les étapes détaillées et tracera le graphique.
          </p>

          <form id="solve-form" onSubmit={handleSolve} className="relative max-w-xl mx-auto z-10">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calculator className="h-5 w-5 text-slate-500 group-focus-within:text-science-500 transition-colors" />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ex: z^2 + 2z + 2 = 0"
                className="block w-full pl-11 pr-14 py-4 bg-slate-900 border-2 border-slate-700 rounded-2xl text-lg font-mono text-slate-100 placeholder:font-sans placeholder:text-slate-600 focus:border-science-600 focus:ring-4 focus:ring-science-900/20 transition-all outline-none shadow-xl shadow-black/10 group-hover:border-slate-600"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 bg-science-600 hover:bg-science-500 text-white rounded-xl px-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-science-900/30 active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </form>

          {/* Examples Pills */}
          <div id="examples-section" className="mt-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Essayer un exemple</span>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => loadExample(ex.equation)}
                  className="bg-slate-900 border border-slate-700 hover:border-science-500/50 hover:bg-slate-800 hover:text-science-400 text-slate-400 text-sm px-4 py-2 rounded-full transition-all shadow-sm"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-start gap-3 text-red-400 animate-in fade-in slide-in-from-bottom-4">
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
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm hover:shadow-md hover:border-slate-700 transition-all">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4 text-science-500">
                <span className="font-serif italic font-bold text-xl">z</span>
              </div>
              <h3 className="font-semibold text-slate-200 mb-2">Analyse Intelligente</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Reconnaissance automatique du type d'équation (polynomiale, système, etc.) et choix de la méthode optimale.</p>
            </div>
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm hover:shadow-md hover:border-slate-700 transition-all">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-200 mb-2">Explications Claires</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Détails pédagogiques étape par étape, expliquant le calcul du discriminant, la forme polaire, etc.</p>
            </div>
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm hover:shadow-md hover:border-slate-700 transition-all">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4 text-amber-500">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-200 mb-2">Visualisation Graphique</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Placement automatique des racines calculées sur un plan d'Argand interactif.</p>
            </div>
          </div>
        )}

        {/* Global History Section */}
        {history.length > 0 && (
          <div id="history-section" className="mt-24 border-t border-slate-800 pt-12 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2 justify-center md:justify-start">
                  <History className="w-6 h-6 text-science-500" />
                  Historique & Vue d'Ensemble
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Visualisation de toutes vos résolutions (30 derniers jours).
                </p>
              </div>
              <button 
                onClick={purgeHistory}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 bg-red-900/10 border border-red-900/30 rounded-lg hover:bg-red-900/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Tout effacer
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* History Legend List */}
              <div className="lg:col-span-1 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      loadExample(item.equation);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-3 h-3 mt-1.5 rounded-full shrink-0 shadow-lg shadow-black/50" 
                        style={{ backgroundColor: item.color }} 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-slate-200 truncate group-hover:text-science-400 transition-colors">
                          {item.equation}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                           {new Date(item.timestamp).toLocaleDateString()} • {item.solution.equationType}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Combined Graph */}
              <div className="lg:col-span-2">
                <ComplexPlane roots={allHistoryRoots} title="Vue Globale de l'Historique" />
                <p className="text-center text-xs text-slate-500 mt-3">
                  Le graphique affiche toutes les racines cumulées. Survolez un point pour voir son équation source.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-10 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-mono font-bold text-xl">i</div>
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