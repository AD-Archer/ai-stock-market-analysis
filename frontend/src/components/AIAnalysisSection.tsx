import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faSpinner, faRobot, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAI } from '../context/ai/AIContext';

/**
 * AIAnalysisSection Component
 * 
 * Displays AI-generated analysis of financial data and documents.
 * Features include:
 * - Generation of AI analysis on demand (only when button is clicked)
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
  } = useAI();

  // Only show loading if aiLoading is true (which only happens after clicking the button)
  const isLoading = aiLoading;
  
  // Determine if we have results to show
  const hasResults = Boolean(aiAnalysis) && !isLoading;

  return (
    <div className="card bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
        <FontAwesomeIcon icon={faChartLine} className="mr-2 text-primary" />
        AI Analysis
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400">
            Get AI-powered analysis of your financial data and documents
          </p>
          <button
            onClick={generateAnalysis}
            disabled={Boolean(isLoading)}
            className={`btn btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
                Generate Analysis
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold mr-1">Error:</strong> {aiError}
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
                  Click the "Generate Analysis" button to start analyzing your data with AI.
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg flex flex-col items-center justify-center">
            <FontAwesomeIcon 
              icon={faRobot} 
              className="text-primary text-5xl mb-4 animate-pulse" 
            />
            <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-center">
              AI Analysis in Progress
            </h3>
            <div className="flex items-center justify-center mt-2">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2 text-primary" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {taskInfo?.message || "Processing your data..."}
              </p>
            </div>
          </div>
        )}

        {hasResults && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Analysis Results
            </h3>
            <div className="mt-4">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiAnalysis}
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