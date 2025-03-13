import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faRobot } from '@fortawesome/free-solid-svg-icons';
import ProgressBar from '../components/ProgressBar';
import { checkDataStatus, fetchStockData, getTaskStatus, getRecommendations } from '../services/api';

const Home: React.FC = () => {
  const [hasData, setHasData] = useState<boolean>(false);
  const [maxStocks, setMaxStocks] = useState<number>(3);
  const [useMockData, setUseMockData] = useState<boolean>(false);
  const [taskRunning, setTaskRunning] = useState<boolean>(false);
  const [taskName, setTaskName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Check if we have data
  useEffect(() => {
    const checkData = async () => {
      try {
        const response = await checkDataStatus();
        setHasData(response.has_data);
      } catch (err) {
        console.error('Error checking data status:', err);
      }
    };

    checkData();
  }, []);

  // Poll task status if a task is running
  useEffect(() => {
    let interval: number | null = null;

    if (taskRunning) {
      interval = window.setInterval(async () => {
        try {
          const status = await getTaskStatus();
          setTaskName(status.task);
          setProgress(status.progress);
          setTotal(status.total);
          setMessage(status.message);

          if (status.complete || status.task === null) {
            setTaskRunning(false);
            // Check if we have data after task completes
            const response = await checkDataStatus();
            setHasData(response.has_data);
          }
        } catch (err) {
          console.error('Error checking task status:', err);
          setTaskRunning(false);
        }
      }, 1000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [taskRunning]);

  const handleFetchData = async () => {
    try {
      setError(null);
      const response = await fetchStockData(maxStocks, useMockData);
      setTaskRunning(true);
      setTaskName(response.task);
    } catch (err: any) {
      console.error('Error fetching stock data:', err);
      setError(err.message || 'Failed to fetch stock data');
    }
  };

  const handleGetRecommendations = async () => {
    try {
      setError(null);
      const response = await getRecommendations();
      
      if (response.success) {
        setTaskRunning(true);
        setTaskName(response.task || 'Generating recommendations');
      } else {
        // Handle unsuccessful response
        setError(response.message || 'Failed to start recommendations task');
      }
    } catch (err: any) {
      console.error('Error getting recommendations:', err);
      // Display the error message from the API
      setError(err.message || 'Failed to get recommendations');
      
      // If there's a task already running, update the UI to show it
      if (err.message && err.message.includes('task is already running')) {
        // Check if we have task info in the error
        if (err.taskInfo) {
          // Use the task info from the error
          setTaskRunning(true);
          setTaskName(err.taskInfo.task);
          setProgress(err.taskInfo.progress);
          setTotal(err.taskInfo.total);
          setMessage(err.taskInfo.message);
        } else {
          // Fall back to getting task status
          const status = await getTaskStatus();
          if (status.task) {
            setTaskRunning(true);
            setTaskName(status.task);
            setProgress(status.progress);
            setTotal(status.total);
            setMessage(status.message);
          }
        }
      }
    }
  };

  return (
    <div>
      <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Stock Market Analysis</h1>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          This application analyzes stock market data and provides investment recommendations using AI.
        </p>
        
        {/* Task Progress */}
        {taskRunning && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {taskName === 'fetch_data' ? 'Fetching Stock Data' : 'Generating Recommendations'}
            </h2>
            <ProgressBar progress={progress} total={total} message={message} />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`border px-4 py-3 rounded relative mb-4 ${
            error.includes('task is already running') 
              ? 'bg-yellow-100 border-yellow-400 text-yellow-700' 
              : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            <strong className="font-bold mr-1">
              {error.includes('task is already running') ? 'Notice:' : 'Error:'}
            </strong>
            {error}
            {error.includes('task is already running') && (
              <p className="mt-1 text-sm">
                The current task's progress is shown below.
              </p>
            )}
          </div>
        )}

        {/* Data Fetching Section */}
        <div className="card bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <FontAwesomeIcon icon={faDatabase} className="mr-2 text-primary" />
            Step 1: Fetch Stock Data
          </h2>
          
          <div className="mb-4">
            <label htmlFor="maxStocks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Number of Stocks to Analyze (1-10):
            </label>
            <input
              type="number"
              id="maxStocks"
              min="1"
              max="10"
              value={maxStocks}
              onChange={(e) => setMaxStocks(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="useMockData"
              checked={useMockData}
              onChange={(e) => setUseMockData(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="useMockData" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Use mock data (faster, for testing)
            </label>
          </div>
          
          <button
            onClick={handleFetchData}
            disabled={taskRunning}
            className="btn bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasData ? 'Refresh Stock Data' : 'Fetch Stock Data'}
          </button>
          
          {hasData && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              ✓ Stock data is available
            </p>
          )}
        </div>

        {/* Recommendations Section */}
        <div className="card bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <FontAwesomeIcon icon={faRobot} className="mr-2 text-secondary" />
            Step 2: Get AI Recommendations
          </h2>
          
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Generate investment recommendations based on the fetched stock data using AI.
          </p>
          
          <button
            onClick={handleGetRecommendations}
            disabled={!hasData || taskRunning}
            className="btn bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Recommendations
          </button>
          
          {!hasData && (
            <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ You need to fetch stock data first
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 