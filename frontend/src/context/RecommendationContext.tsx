import React, { createContext, useContext, useState } from 'react';
import { viewRecommendation } from '../services/api';

interface RecommendationContextType {
  content: string;
  loading: boolean;
  error: string | null;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  handlePrint: () => void;
  toggleDarkMode: () => void;
  fetchContent: (filename: string) => Promise<void>;
}

const RecommendationContext = createContext<RecommendationContextType | undefined>(undefined);

export const RecommendationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(document.documentElement.classList.contains('dark'));

  const fetchContent = async (filename: string) => {
    if (!filename) {
      setError('No filename provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await viewRecommendation(filename);
      
      if (response.success) {
        setContent(response.content);
        setError(null);
      } else {
        setError(response.message || 'Failed to load recommendation');
      }
    } catch (err) {
      console.error('Error fetching recommendation:', err);
      setError('Failed to load recommendation. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setDarkMode(!darkMode);
  };

  return (
    <RecommendationContext.Provider
      value={{
        content,
        loading,
        error,
        darkMode,
        setDarkMode,
        handlePrint,
        toggleDarkMode,
        fetchContent,
      }}
    >
      {children}
    </RecommendationContext.Provider>
  );
};

export const useRecommendation = () => {
  const context = useContext(RecommendationContext);
  if (context === undefined) {
    throw new Error('useRecommendation must be used within a RecommendationProvider');
  }
  return context;
}; 