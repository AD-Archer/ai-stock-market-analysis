import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faDownload, faEye, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getDownloadUrl } from '../services/api';
import { useResults } from '../context/ResultsContext';

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

  return (
    <div className="card bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
        <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-primary" />
        Analysis Results
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold mr-1">Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-primary" />
        </div>
      ) : files.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No results available</p>
      ) : (
        <div className="space-y-4">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{file.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(file.date)} • {formatSize(file.size)}
                </p>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/view/${file.name}`}
                  className="btn btn-secondary"
                >
                  <FontAwesomeIcon icon={faEye} className="mr-2" />
                  View
                </Link>
                <a
                  href={getDownloadUrl(file.name)}
                  download
                  className="btn btn-primary"
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