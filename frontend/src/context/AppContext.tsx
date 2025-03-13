import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkDataStatus, fetchStockData, getTaskStatus, getRecommendations } from '../services/api';

interface AppContextType {
  hasData: boolean;
  maxStocks: number;
  useMockData: boolean;
  taskRunning: boolean;
  taskName: string | null;
  progress: number;
  total: number;
  message: string;
  error: string | null;
  setMaxStocks: (value: number) => void;
  setUseMockData: (value: boolean) => void;
  handleFetchData: () => Promise<void>;
  handleGetRecommendations: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasData, setHasData] = useState<boolean>(false);
  const [maxStocks, setMaxStocks] = useState<number>(3);
  const [useMockData, setUseMockData] = useState<boolean>(false);
  const [taskRunning, setTaskRunning] = useState<boolean>(false);
  const [taskName, setTaskName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Check if we have data
  useEffect(() => {
    const checkData = async () => {
      try {
        const response = await checkDataStatus();
        setHasData(response.has_data);
      } catch (err) {
        console.error('Error checking data status:', err);
      }
    };

    checkData();
  }, []);

  // Poll task status if a task is running
  useEffect(() => {
    let interval: number | null = null;

    if (taskRunning) {
      interval = window.setInterval(async () => {
        try {
          const status = await getTaskStatus();
          setTaskName(status.task);
          setProgress(status.progress);
          setTotal(status.total);
          setMessage(status.message);

          if (status.complete || status.task === null) {
            setTaskRunning(false);
            // Check if we have data after task completes
            const response = await checkDataStatus();
            setHasData(response.has_data);
          }
        } catch (err) {
          console.error('Error checking task status:', err);
          setTaskRunning(false);
        }
      }, 1000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [taskRunning]);

  const handleFetchData = async () => {
    try {
      setError(null);
      const response = await fetchStockData(maxStocks, useMockData);
      setTaskRunning(true);
      setTaskName(response.task);
    } catch (err: any) {
      console.error('Error fetching stock data:', err);
      setError(err.message || 'Failed to fetch stock data');
    }
  };

  const handleGetRecommendations = async () => {
    try {
      setError(null);
      const response = await getRecommendations();
      
      if (response.success) {
        setTaskRunning(true);
        setTaskName(response.task || 'Generating recommendations');
      } else {
        setError(response.message || 'Failed to start recommendations task');
      }
    } catch (err: any) {
      console.error('Error getting recommendations:', err);
      setError(err.message || 'Failed to get recommendations');
      
      if (err.message && err.message.includes('task is already running')) {
        if (err.taskInfo) {
          setTaskRunning(true);
          setTaskName(err.taskInfo.task);
          setProgress(err.taskInfo.progress);
          setTotal(err.taskInfo.total);
          setMessage(err.taskInfo.message);
        } else {
          const status = await getTaskStatus();
          if (status.task) {
            setTaskRunning(true);
            setTaskName(status.task);
            setProgress(status.progress);
            setTotal(status.total);
            setMessage(status.message);
          }
        }
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        hasData,
        maxStocks,
        useMockData,
        taskRunning,
        taskName,
        progress,
        total,
        message,
        error,
        setMaxStocks,
        setUseMockData,
        handleFetchData,
        handleGetRecommendations,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 