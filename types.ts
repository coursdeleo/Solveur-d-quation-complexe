export interface ComplexRoot {
  real: number;
  imaginary: number;
  label: string; // e.g., "z1", "z2"
  color?: string; // Optional: specific color for graph
  sourceEquation?: string; // Optional: name of the equation this root belongs to
}

export interface SolutionResponse {
  roots: ComplexRoot[];
  latexSolution: string; // A concise summary in mathematical notation
  explanationSteps: string[]; // Step by step textual explanation
  equationType: string; // e.g., "Quadratic", "Polynomial", "Trigonometric"
}

export interface Example {
  label: string;
  equation: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  equation: string;
  solution: SolutionResponse;
  color: string;
}