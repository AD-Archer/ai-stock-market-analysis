import React, { createContext, useContext, useState, useEffect } from 'react';
import { getRecommendations, getTaskStatus } from '../../services/api';

interface TaskInfo {
  complete: boolean;
  progress: number;
  total: number;
  message: string;
}

interface AIContextType {
  aiAnalysis: string | null;
  aiLoading: boolean;
  aiError: string | null;
  taskInfo: TaskInfo | null;
  generateAnalysis: () => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [taskInfo, setTaskInfo] = useState<TaskInfo | null>(null);

  // Function to fetch recommendation content with retries
  const fetchRecommendationContent = async (retries = 5): Promise<string | null> => {
    try {
      console.log('Fetching results...');
      const response = await fetch('/api/results');
      const data = await response.json();
      console.log('Results response:', data);
      
      if (data.files && data.files.length > 0) {
        const latestFile = data.files[0];
        console.log('Latest file:', latestFile);
        
        const contentResponse = await fetch(`/api/view-recommendation/${latestFile.name}`);
        const contentData = await contentResponse.json();
        console.log('Content response:', contentData);
        
        if (contentData.success) {
          return contentData.content;
        } else {
          console.error('Content fetch failed:', contentData.message);
        }
      } else {
        console.log('No files found in results');
      }
      
      if (retries > 0) {
        console.log(`Retrying in 2 seconds... (${retries} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchRecommendationContent(retries - 1);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      if (retries > 0) {
        console.log(`Retrying in 2 seconds... (${retries} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchRecommendationContent(retries - 1);
      }
      throw error;
    }
  };

  // Function to check task status
  const checkTaskStatus = async () => {
    try {
      const status = await getTaskStatus();
      console.log('Task status:', status);
      setTaskInfo(status);
      
      if (status.complete) {
        setAiLoading(false);
        if (status.message.startsWith('Error:')) {
          setAiError(status.message);
        } else {
          try {
            console.log('Task complete, fetching content...');
            const content = await fetchRecommendationContent();
            if (content) {
              console.log('Content fetched successfully');
              setAiAnalysis(content);
            } else {
              console.error('Failed to fetch content after all retries');
              setAiError('Failed to load recommendation content after multiple attempts. Please try again.');
            }
          } catch (error: any) {
            console.error('Error in checkTaskStatus:', error);
            setAiError(`Error loading recommendation: ${error.message}`);
          }
        }
      } else {
        setTimeout(checkTaskStatus, 2000);
      }
    } catch (error: any) {
      console.error('Error checking task status:', error);
      setAiError(error.message);
      setAiLoading(false);
    }
  };

  // Function to generate AI analysis
  const generateAnalysis = async () => {
    try {
      setAiLoading(true);
      setAiError(null);
      setAiAnalysis(null);
      
      const response = await getRecommendations();
      setTaskInfo(response.task_info);
      
      checkTaskStatus();
    } catch (error: any) {
      setAiError(error.message);
      setAiLoading(false);
      if (error.taskInfo) {
        setTaskInfo(error.taskInfo);
      }
    }
  };

  // Effect to check task status when component mounts
  useEffect(() => {
    checkTaskStatus();
  }, []);

  const value = {
    aiAnalysis,
    aiLoading,
    aiError,
    taskInfo,
    generateAnalysis,
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}; 