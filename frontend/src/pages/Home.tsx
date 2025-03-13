import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faRobot } from '@fortawesome/free-solid-svg-icons';
import ProgressBar from '../components/ProgressBar';
import { useApp } from '../context/AppContext';

const Home: React.FC = () => {
  const {
    hasData,
    maxStocks,
    useMockData,
    taskRunning,
    taskName,
    progress,
    total,
    message,
    error,
    setMaxStocks,
    setUseMockData,
    handleFetchData,
    handleGetRecommendations,
  } = useApp();

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