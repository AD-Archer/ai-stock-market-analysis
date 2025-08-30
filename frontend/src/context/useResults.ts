import { useContext } from 'react';
import { ResultsContext } from './ResultsContextBase.tsx';

export const useResults = () => {
  const ctx = useContext(ResultsContext);
  if (!ctx) throw new Error('useResults must be used within a ResultsProvider');
  return ctx;
};