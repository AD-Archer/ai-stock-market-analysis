import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faSpinner } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAI } from '../context/ai/AIContext';

const AIAnalysisSection: React.FC = () => {
  const {
    aiAnalysis,
    aiLoading,
    aiError,
    taskInfo,
    generateAnalysis,
  } = useAI();

  return (
    <div className="card bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
        <FontAwesomeIcon icon={faChartLine} className="mr-2 text-primary" />
        AI Analysis
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400">
            Get AI-powered investment recommendations based on current market data
          </p>
          <button
            onClick={generateAnalysis}
            disabled={aiLoading}
            className={`btn btn-primary ${aiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {aiLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              'Generate Analysis'
            )}
          </button>
        </div>

        {aiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold mr-1">Error:</strong> {aiError}
          </div>
        )}

        {taskInfo && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {taskInfo.complete ? 'Latest Analysis' : 'Analysis in Progress'}
            </h3>
            {!taskInfo.complete && (
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(taskInfo.progress / taskInfo.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {taskInfo.message} ({Math.round((taskInfo.progress / taskInfo.total) * 100)}%)
                </p>
              </div>
            )}
            {taskInfo.complete && aiAnalysis && (
              <div className="mt-4">
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiAnalysis}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisSection; 