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
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [taskRunning]);

  const handleFetchData = async () => {
    try {
      setError(null);
      const response = await fetchStockData(maxStocks, useMockData);
      if (response.success) {
        setTaskRunning(true);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching data');
    }
  };

  const handleGetRecommendations = async () => {
    try {
      setError(null);
      const response = await getRecommendations();
      if (response.success) {
        setTaskRunning(true);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error getting recommendations');
    }
  };

  return (
    <div className="home-page">
      <div className="jumbotron bg-light p-5 rounded">
        <h1 className="display-4">Stock Market Analysis</h1>
        <p className="lead">
          Analyze stock market data and get AI-powered investment recommendations.
        </p>
        <hr className="my-4" />

        {error && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        {taskRunning ? (
          <div className="task-status">
            <h3>{taskName}</h3>
            <ProgressBar progress={progress} total={total} message={message} />
          </div>
        ) : (
          <div className="actions">
            <div className="card mb-4">
              <div className="card-header">
                <h3>
                  <FontAwesomeIcon icon={faDatabase} className="me-2" />
                  Step 1: Fetch Stock Data
                </h3>
              </div>
              <div className="card-body">
                <p>
                  {hasData
                    ? 'You already have stock data. You can fetch new data or proceed to get recommendations.'
                    : 'First, you need to fetch stock market data. This will download information about the top 3 NASDAQ stocks due to API rate limits.'}
                </p>

                <div className="mb-3">
                  <label htmlFor="maxStocks" className="form-label">
                    Maximum number of stocks to fetch:
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="maxStocks"
                    value={maxStocks}
                    onChange={(e) => setMaxStocks(parseInt(e.target.value))}
                    min="3"
                    max="3"
                    disabled={true}
                  />
                  <div className="form-text text-danger">
                    <strong>Note:</strong> Due to Alpha Vantage API rate limits (25 requests per day), we're currently limited to fetching only the top 3 stocks.
                  </div>
                </div>

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="useMockData"
                    checked={useMockData}
                    onChange={(e) => setUseMockData(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="useMockData">
                    Use mock data (for testing)
                  </label>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleFetchData}
                  disabled={taskRunning}
                >
                  Fetch Stock Data
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>
                  <FontAwesomeIcon icon={faRobot} className="me-2" />
                  Step 2: Get AI Recommendations
                </h3>
              </div>
              <div className="card-body">
                <p>
                  {hasData
                    ? 'Get AI-powered investment recommendations based on the fetched stock data.'
                    : 'You need to fetch stock data first before getting recommendations.'}
                </p>

                <button
                  className="btn btn-success"
                  onClick={handleGetRecommendations}
                  disabled={!hasData || taskRunning}
                >
                  Get Recommendations
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 