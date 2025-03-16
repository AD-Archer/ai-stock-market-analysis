import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faRobot, faFileAlt, faFileExcel, faInfoCircle, faFlask, faHome, faCode } from '@fortawesome/free-solid-svg-icons';
import { faReact } from '@fortawesome/free-brands-svg-icons';
import { useState, useEffect } from 'react';

/**
 * Home Component
 * 
 * The main landing page component for the Stock Market Analysis Dashboard.
 * Features a welcome message, feature highlights, and real-time backend status monitoring.
 * 
 * @component
 * @returns {JSX.Element} The rendered Home component
 */
const Home: React.FC = () => {
  /** State to track the backend API status */
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    /**
     * Checks the backend API health status
     * Makes a request to the /api/health endpoint and updates the status accordingly
     */
    const checkBackendStatus = async () => {
      try {
        await fetch('/api/health');
        setBackendStatus('online');
      } catch (error) {
        console.error('Backend status check failed:', error);
        setBackendStatus('offline');
      }
    };

    checkBackendStatus();
    // Check backend status every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Introduction Section - Displays the main welcome message and feature highlights */}
      <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4">Stock Market Analysis Dashboard <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2 dark:bg-blue-900 dark:text-blue-100">Demo App</span></h1>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 dark:bg-yellow-900/30 dark:border-yellow-600">
          <div className="flex">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-400 dark:text-yellow-300" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                <strong>Demo Application:</strong> This is a demonstration tool and does not reflect actual market data. 
                It's designed to analyze spreadsheets and markdown files using AI to generate insights and recommendations. Please do not make any investment decisions based on the analysis provided by this tool.
              </p>
            </div>
          </div>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-4">
            Welcome to the Stock Market Analysis Dashboard, a tool for analyzing financial data from spreadsheets and documents with AI-powered insights.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faFileExcel} className="text-green-600 text-xl" />
              <span>Spreadsheet data analysis</span>
            </div>
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faRobot} className="text-secondary text-xl" />
              <span>AI-powered recommendations</span>
            </div>
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faFileAlt} className="text-blue-500 text-xl" />
              <span>Markdown file processing</span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            This tool helps you analyze financial data and documents by leveraging AI to generate insights and recommendations. Navigate to the Results page to view detailed analysis reports.
          </p>
        </div>
      </div>

      {/* Tech Stack Information - Shows the technologies used and hosting information */}
      <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-3">Tech Stack & Hosting</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faReact} className="text-blue-400 text-xl" />
            <span>Built with React.js</span>
          </div>
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faFlask} className="text-purple-500 text-xl" />
            <span>Flask Python Backend</span>
          </div>
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faHome} className="text-green-500 text-xl" />
            <span>Self-hosted locally</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          If you're viewing this that means that this application is running on a 2011 macbook pro running ubuntu in my basement...hopefully.
        </p>
      </div>

      {/* Backend Status Indicator - Shows real-time API connection status */}
      <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center">
          <FontAwesomeIcon icon={faServer} className="mr-2 text-primary" />
          System Status
        </h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            backendStatus === 'online' ? 'bg-green-500' :
            backendStatus === 'offline' ? 'bg-red-500' :
            'bg-yellow-500 animate-pulse'
          }`} />
          <span className="text-gray-700 dark:text-gray-300">
            {backendStatus === 'online' ? 'API is online and ready' :
             backendStatus === 'offline' ? 'API is offline - please try again later' :
             'Checking API status...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home; 