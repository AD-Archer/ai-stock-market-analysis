import React, { useState, useCallback, useRef } from 'react';
import { viewRecommendation, getResults } from '../services/api';
import { RecommendationContext, FileMetadata } from './RecommendationContextBase';

export const RecommendationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(document.documentElement.classList.contains('dark'));
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  
  // Cache to prevent redundant API calls
  const contentCache = useRef<Map<string, { content: string; metadata: FileMetadata | null }>>(new Map());
  const currentRequest = useRef<string | null>(null);

  const fetchContent = useCallback(async (filename: string) => {
    if (!filename) {
      setError('No filename provided');
      setLoading(false);
      return;
    }

    // Check if content is already cached
    if (contentCache.current.has(filename)) {
      const cached = contentCache.current.get(filename)!;
      setContent(cached.content);
      setFileMetadata(cached.metadata);
      setError(null);
      setLoading(false);
      return;
    }

    // Prevent duplicate requests for the same file
    if (currentRequest.current === filename) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      currentRequest.current = filename;
      
      // Fetch file content
      const response = await viewRecommendation(filename);
      
      if (response.success) {
        // Try to get metadata from the response if available
        let metadata: FileMetadata | null = null;
        
        // If the response includes metadata, use it; otherwise try to fetch it separately
        if (response.metadata) {
          metadata = response.metadata;
        } else {
          try {
            const resultsResponse = await getResults();
            if (resultsResponse.files && resultsResponse.files.length > 0) {
              const file = resultsResponse.files.find((f: FileMetadata) => f.name === filename);
              if (file) {
                metadata = file;
              }
            }
          } catch (metadataErr) {
            console.error('Error fetching file metadata:', metadataErr);
            // Continue even if metadata fetch fails
          }
        }
        
        // Cache the result
        contentCache.current.set(filename, { content: response.content, metadata });
        
        setContent(response.content);
        setFileMetadata(metadata);
        setError(null);
      } else {
        setError(response.message || 'Failed to load recommendation');
      }
    } catch (err) {
      console.error('Error fetching recommendation:', err);
      setError('Failed to load recommendation. Please try again later.');
    } finally {
      setLoading(false);
      currentRequest.current = null;
    }
  }, []); // Empty dependency array since the function doesn't depend on any state

  // Clear cache function
  const clearCache = useCallback(() => {
    contentCache.current.clear();
  }, []);

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
        fileMetadata,
        setDarkMode,
        handlePrint,
        toggleDarkMode,
        fetchContent,
        clearCache,
      }}
    >
      {children}
    </RecommendationContext.Provider>
  );
};

// Custom hook exported from separate file to satisfy react-refresh rule