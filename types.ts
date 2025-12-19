export interface TranslationResult {
  original: string;
  translated: string;
  confidence: string; // 'high' | 'medium' | 'low'
  isDictionaryMatch: boolean;
}

export interface DictionaryEntry {
  id: string;
  term: string; // e.g., "Offset"
  translation: string; // e.g., "Dời song song"
  category: 'general' | 'bridge' | 'road' | 'revit';
}

export interface AnalyzeResponse {
  translations: TranslationResult[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}