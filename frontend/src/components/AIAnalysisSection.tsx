import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faSpinner, faRobot, faLightbulb, faUpload, faFile, faFileAlt, faFileCsv } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAI } from '../context/ai/AIContext';
import { uploadFiles } from '../services/api';

/**
 * AIAnalysisSection Component
 * 
 * Displays AI-generated analysis of financial data and documents.
 * Features include:
 * - Generation of AI analysis on demand (only when button is clicked)
 * - File upload support for CSV, MD, and TXT files
 * - Loading state indication
 * - Error handling and display
 * - Markdown rendering of AI analysis results
 * 
 * Uses the AIContext for managing AI analysis state and generation.
 * 
 * @component
 * @returns {JSX.Element} The rendered AI analysis section
 */
const AIAnalysisSection: React.FC = () => {
  const {
    aiAnalysis,
    aiLoading,
    aiError,
    taskInfo,
    generateAnalysis,
    setAiError
  } = useAI();

  // State for file uploads
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileAnalysis, setFileAnalysis] = useState<string | null>(null);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only show loading if aiLoading is true (which only happens after clicking the button)
  const isLoading = aiLoading || fileUploadLoading;
  
  // Determine if we have results to show
  const hasResults = Boolean(aiAnalysis || fileAnalysis) && !isLoading;
  
  // Get the analysis content to display
  const analysisContent = fileAnalysis || aiAnalysis;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Filter for only supported file types
      const validFiles = filesArray.filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return extension === 'csv' || extension === 'md' || extension === 'txt' || extension === 'xlsx' || extension === 'json';
      });
      setSelectedFiles(validFiles);
    }
  };

  // Handle file removal
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle analysis generation with files
  const handleGenerateAnalysis = async () => {
    // Clear previous analysis
    setFileAnalysis(null);
    
    // If files are selected, upload them and get analysis
    if (selectedFiles.length > 0) {
      try {
        setFileUploadLoading(true);
        setAiError('');
        
        const response = await uploadFiles(selectedFiles);
        
        if (response.success && response.analysis) {
          setFileAnalysis(response.analysis);
        } else if (response.success) {
          setAiError('Files uploaded successfully, but no analysis was generated.');
        } else {
          setAiError(response.message || 'Failed to upload files');
        }
      } catch (error: unknown) {
        setAiError(error instanceof Error ? error.message : 'Failed to upload and analyze files');
      } finally {
        setFileUploadLoading(false);
      }
    } else {
      // Otherwise, call the regular generateAnalysis function
      generateAnalysis();
    }
  };

  // Get file icon based on file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'csv':
        return faFileCsv;
      case 'md':
        return faFileAlt;
      case 'txt':
      default:
        return faFile;
    }
  };

  return (
    <div className="card bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 w-full">
      <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
        <FontAwesomeIcon icon={faChartLine} className="mr-2 text-blue-600 flex-shrink-0" />
        <span>AI Analysis</span>
      </h2>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <p className="text-gray-600 dark:text-gray-400">
            Get AI-powered analysis of your financial data and documents
          </p>
          <button
            onClick={handleGenerateAnalysis}
            disabled={Boolean(isLoading)}
            className={`btn btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} flex-shrink-0`}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                {fileUploadLoading ? 'Analyzing Files...' : 'Analyzing...'}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
                {selectedFiles.length > 0 ? 'Analyze Files' : 'Generate Analysis'}
              </>
            )}
          </button>
        </div>

        {/* File Upload Section */}
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="btn btn-secondary flex-shrink-0"
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faUpload} className="mr-2" />
              Upload Files
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Supported: CSV, MD, TXT, XLSX, JSON
            </span>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept=".csv,.md,.txt,.xlsx,.json"
            disabled={isLoading}
          />
          
          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Files ({selectedFiles.length}):
              </p>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <div className="flex items-center min-w-0 flex-1">
                      <FontAwesomeIcon icon={getFileIcon(file.name)} className="mr-2 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                    </div>
                    <button 
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 ml-2 flex-shrink-0"
                      disabled={isLoading}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {aiError && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            <strong className="font-bold mr-1">Error:</strong> 
            <span className="break-words">{aiError}</span>
          </div>
        )}

        {!isLoading && !hasResults && !aiError && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-600 p-4 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faLightbulb} className="text-blue-400 dark:text-blue-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  {selectedFiles.length > 0 
                    ? "Click the \"Analyze Files\" button to analyze your uploaded files with AI."
                    : "Click the \"Generate Analysis\" button to start analyzing your data with AI."}
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg flex flex-col items-center justify-center min-h-[200px]">
            <FontAwesomeIcon 
              icon={faRobot} 
              className="text-blue-600 text-5xl mb-4 animate-pulse" 
            />
            <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-center">
              AI Analysis in Progress
            </h3>
            <div className="flex items-center justify-center mt-2">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2 text-blue-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {fileUploadLoading 
                  ? "Analyzing your uploaded files..." 
                  : (taskInfo?.message || "Processing your data...")}
              </p>
            </div>
          </div>
        )}

        {hasResults && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Analysis Results
            </h3>
            <div className="mt-4 max-w-none">
              <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {analysisContent || ''}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisSection; 