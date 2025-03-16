import React, { createContext, useContext, useState, useEffect } from 'react';
import { getRecommendations, getTaskStatus, uploadFiles as apiUploadFiles } from '../../services/api';

/**
 * Task Information Interface
 * 
 * @interface TaskInfo
 * @property {boolean} complete - Whether the task has completed
 * @property {number} progress - Current progress value
 * @property {number} total - Total steps in the task
 * @property {string} message - Current task status message
 */
interface TaskInfo {
  complete: boolean;
  progress: number;
  total: number;
  message: string;
}

/**
 * AI Context Type Definition
 * 
 * @interface AIContextType
 * @property {string | null} aiAnalysis - Current AI analysis content
 * @property {boolean} aiLoading - Loading state indicator
 * @property {string | null} aiError - Error message if any
 * @property {TaskInfo | null} taskInfo - Current task status information
 * @property {function} generateAnalysis - Initiates new AI analysis generation
 * @property {function} setAiAnalysis - Sets the AI analysis content
 * @property {function} setAiError - Sets the AI error message
 * @property {function} setAiLoading - Sets the AI loading state
 */
interface AIContextType {
  aiAnalysis: string | null;
  aiLoading: boolean;
  aiError: string | null;
  taskInfo: TaskInfo | null;
  generateAnalysis: (files?: File[]) => Promise<void>;
  setAiAnalysis: (analysis: string | null) => void;
  setAiError: (error: string | null) => void;
  setAiLoading: (loading: boolean) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

/**
 * Custom hook for accessing the AI context
 * 
 * @function useAI
 * @returns {AIContextType} The AI context value
 * @throws {Error} If used outside of AIProvider
 */
export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

/**
 * AI Context Provider
 * 
 * Manages the AI analysis state and operations including:
 * - Analysis content storage
 * - Analysis generation
 * - Task status tracking
 * - Error handling
 * - File upload handling for CSV, MD, and TXT files
 * 
 * Provides real-time updates on analysis generation progress
 * and handles retries for result fetching.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with the provider
 * @returns {JSX.Element} The provider component
 */
export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [taskInfo, setTaskInfo] = useState<TaskInfo | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

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

  // Function to upload files
  const uploadFiles = async (files: File[]): Promise<boolean> => {
    try {
      const result = await apiUploadFiles(files);
      if (!result.success) {
        throw new Error(result.message || 'Failed to upload files');
      }
      return true;
    } catch (error: any) {
      console.error('Error uploading files:', error);
      throw error;
    }
  };

  // Function to generate AI analysis
  const generateAnalysis = async (files?: File[]) => {
    try {
      setAiLoading(true);
      setAiError(null);
      setAiAnalysis(null);
      
      // If files are provided, upload them first
      if (files && files.length > 0) {
        try {
          await uploadFiles(files);
          console.log('Files uploaded successfully');
        } catch (error: any) {
          setAiError(`Error uploading files: ${error.message}`);
          setAiLoading(false);
          return;
        }
      }
      
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

  const contextValue: AIContextType = {
    aiAnalysis,
    aiLoading,
    aiError,
    taskInfo,
    generateAnalysis,
    setAiAnalysis,
    setAiError,
    setAiLoading
  };

  return <AIContext.Provider value={contextValue}>{children}</AIContext.Provider>;
}; 