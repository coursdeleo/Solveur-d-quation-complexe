import { GoogleGenAI, Type } from "@google/genai";
import { SolutionResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const solveComplexEquation = async (equation: string): Promise<SolutionResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Résous l'équation complexe suivante dans l'ensemble C: ${equation}. 
      Je veux les racines exactes (ou approchées si nécessaire) et une explication pas à pas.`,
      config: {
        systemInstruction: `Tu es un expert en mathématiques spécialisé dans l'analyse complexe. 
        Ton but est de résoudre des équations pour l'inconnue 'z'.
        
        Règles de sortie :
        1. Identifie le type d'équation.
        2. Trouve toutes les racines complexes.
        3. Formate la réponse strictement selon le schéma JSON fourni.
        4. Pour 'roots', fournis la partie réelle et imaginaire sous forme de nombres flottants pour le graphique.
        5. Pour 'explanationSteps', explique la méthode utilisée (discriminant, forme exponentielle, etc.) en français, étape par étape. Utilise un formatage Markdown léger (gras, code) si utile.
        6. Pour 'latexSolution', donne la solution finale sous une forme concise (ex: "S = \{ 1+i, 1-i \}").`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  real: { type: Type.NUMBER, description: "Partie réelle de la racine" },
                  imaginary: { type: Type.NUMBER, description: "Partie imaginaire de la racine" },
                  label: { type: Type.STRING, description: "Nom de la racine, ex: z1" }
                },
                required: ["real", "imaginary", "label"]
              }
            },
            latexSolution: {
              type: Type.STRING,
              description: "Résumé mathématique de la solution"
            },
            explanationSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Étapes détaillées de la résolution en français"
            },
            equationType: {
              type: Type.STRING,
              description: "Type mathématique de l'équation"
            }
          },
          required: ["roots", "latexSolution", "explanationSteps", "equationType"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Réponse vide de l'IA");
    }

    return JSON.parse(text) as SolutionResponse;

  } catch (error) {
    console.error("Erreur lors de la résolution:", error);
    throw new Error("Impossible de résoudre cette équation pour le moment. Vérifiez la syntaxe.");
  }
};