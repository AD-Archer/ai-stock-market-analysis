import { createContext } from 'react';
import type { } from 'react';

export interface FileMetadata {
  name: string;
  date: string;
  size: number;
}

export interface RecommendationContextType {
  content: string;
  loading: boolean;
  error: string | null;
  darkMode: boolean;
  fileMetadata: FileMetadata | null;
  setDarkMode: (value: boolean) => void;
  handlePrint: () => void;
  toggleDarkMode: () => void;
  fetchContent: (filename: string) => Promise<void>;
  clearCache: () => void;
}

export const RecommendationContext = createContext<RecommendationContextType | undefined>(undefined);
