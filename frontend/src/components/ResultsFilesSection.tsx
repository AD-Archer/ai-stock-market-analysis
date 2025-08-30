import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faDownload, faEye, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getDownloadUrl } from '../services/api';
import { useResults } from '../context/useResults';
import type { ResultFile } from '../context/ResultsContextBase';

/**
 * ResultsFilesSection Component
 * 
 * Displays a list of generated analysis result files with the following features:
 * - File metadata display (name, date, size)
 * - Download functionality for each file
 * - Preview/view capability for supported file types
 * - Loading state indication
 * - Error handling and display
 * - Empty state handling
 * 
 * Uses the ResultsContext to manage file listing state and operations.
 * Provides a consistent interface for accessing and managing analysis results.
 * 
 * @component
 * @returns {JSX.Element} The rendered results files section
 */
const ResultsFilesSection: React.FC = () => {
  const {
    files,
    loading,
    error,
    formatDate,
    formatSize,
  } = useResults();

  // Memoize the files list to prevent unnecessary re-renders
  const memoizedFiles = React.useMemo(() => files, [files]);

  return (
    <div className="card bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 w-full">
      <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
        <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-blue-600 flex-shrink-0" />
        <span>Analysis Results</span>
      </h2>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
          <strong className="font-bold mr-1">Error:</strong> 
          <span className="break-words">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-600 text-2xl mb-2" />
          <p className="text-gray-500 dark:text-gray-400">Loading results...</p>
        </div>
      ) : memoizedFiles.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 text-4xl mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No results available</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Generate an AI analysis to see results here
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {memoizedFiles.map((file: ResultFile) => (
            <div
              key={file.name}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="mb-3 sm:mb-0 min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white break-words">{file.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatDate(file.date)} • {formatSize(file.size)}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto flex-shrink-0">
                <Link
                  to={`/view/${file.name}`}
                  className="btn btn-secondary w-full sm:w-auto text-center inline-flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faEye} className="mr-2" />
                  View
                </Link>
                <a
                  href={getDownloadUrl(file.name)}
                  download
                  className="btn btn-primary w-full sm:w-auto text-center inline-flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsFilesSection; 