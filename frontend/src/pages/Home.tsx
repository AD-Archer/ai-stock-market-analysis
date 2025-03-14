import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faChartLine, faRobot } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

const Home: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
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
    const interval = setInterval(checkBackendStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Introduction Section */}
      <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4">Stock Market Analysis Dashboard</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-4">
            Welcome to the Stock Market Analysis Dashboard, your comprehensive tool for analyzing NASDAQ-100 stocks and getting AI-powered investment insights.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faChartLine} className="text-primary text-xl" />
              <span>Real-time stock data analysis(Not Really)</span>
            </div>
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faRobot} className="text-secondary text-xl" />
              <span>AI-powered recommendations</span>
            </div>
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faChartLine} className="text-primary text-xl" />
              <span>Comprehensive market insights</span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Navigate to the Results page to view detailed analysis and recommendations.
          </p>
        </div>
      </div>

      {/* Backend Status Section */}
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