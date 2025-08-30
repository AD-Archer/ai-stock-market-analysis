import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faFileAlt, faDownload, faEye, faSpinner } from '@fortawesome/free-solid-svg-icons';
import SummaryStats from '../components/stock/SummaryStats';
import StockFilters from '../components/stock/StockFilters';
import StockTable from '../components/stock/StockTable';
import AIAnalysisSection from '../components/AIAnalysisSection';
import { StocksProvider } from '../context/stocks/StocksContext';
import { AIProvider } from '../context/ai/AIContext';
import { getResults, getDownloadUrl } from '../services/api';
import { generateSlug } from '../utils/slug';

// Simple Files Component that doesn't conflict with other contexts
const SimpleFilesSection: React.FC = () => {
  const [files, setFiles] = useState<Array<{name: string; date: string; size: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchFiles = async () => {
      try {
        const response = await getResults();
        if (isMounted) {
          if (response.files) {
            setFiles(response.files);
            setError(null);
          } else {
            setError('No files found');
            setFiles([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching files:', err);
          setError('Failed to load files');
          setFiles([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFiles();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="card bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 w-full">
      <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
        <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-blue-600 flex-shrink-0" />
        <span>Analysis Files</span>
      </h2>
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-3 rounded mb-4 text-sm text-yellow-800 dark:text-yellow-200">
        These reports use demo / cached data for illustration only. Do not use for real investment decisions.
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
          <strong className="font-bold mr-1">Error:</strong> 
          <span className="break-words">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-600 text-2xl mb-2" />
          <p className="text-gray-500 dark:text-gray-400">Loading files...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 text-4xl mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No analysis files available</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Generate an AI analysis to create files
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="mb-3 sm:mb-0 min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white break-words">{file.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatDate(file.date)} • {formatSize(file.size)}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto flex-shrink-0">
                <Link
                  to={`/report/${generateSlug(file.name, file.date)}`}
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

/**
 * Results Page Component
 * 
 * Displays comprehensive stock market analysis results including:
 * - NASDAQ-100 stock data table with filtering capabilities
 * - Summary statistics of the analyzed stocks
 * - AI-powered analysis and recommendations
 * - Generated analysis files and reports
 * 
 * This component is wrapped with StocksProvider and AIProvider to manage
 * stock data and AI analysis state respectively.
 * 
 * @component
 * @returns {JSX.Element} The rendered Results page
 */
const Results: React.FC = () => {
  return (
    <div className="min-h-screen w-full">
      <StocksProvider>
        <AIProvider>
          <div className="space-y-8 max-w-full">
            {/* Stock Data Section - Main section displaying stock information and filters */}
            <div className="card bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 w-full">
              <h1 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white break-words">
                <FontAwesomeIcon icon={faChartLine} className="mr-2 text-blue-600 flex-shrink-0" />
                <span className="break-words">NASDAQ-100 Stock Data (This is out of date, please supply your own stock data for an accurate analysis)</span>
              </h1>

              <SummaryStats />
              <StockFilters />
              <StockTable />
            </div>

            <AIAnalysisSection />
            <SimpleFilesSection />
            
          </div>
        </AIProvider>
      </StocksProvider>
    </div>
  );
};

export default Results;