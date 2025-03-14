import React from 'react';
import { useStocks } from '../../context/stocks/StocksContext';

/**
 * SummaryStats Component
 * 
 * Displays a summary dashboard of key stock market statistics including:
 * - Average Year-to-Date (YTD) performance across all stocks
 * - Top performing stock with its YTD return
 * - Bottom performing stock with its YTD return
 * - Best performing sector with its average YTD return
 * 
 * The component uses the StocksContext to calculate and display these metrics
 * in a responsive grid layout with color-coded performance indicators.
 * 
 * @component
 * @returns {JSX.Element | null} The rendered summary statistics dashboard or null if no data
 */
const SummaryStats: React.FC = () => {
  const { calculateSummaryStats } = useStocks();
  const summaryStats = calculateSummaryStats();

  if (!summaryStats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average YTD</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {summaryStats.avgYtd.toFixed(2)}%
        </p>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Performer</h3>
        <p className="text-2xl font-bold text-green-600">
          {summaryStats.topPerformers[0]?.symbol}: {summaryStats.topPerformers[0]?.ytd.toFixed(2)}%
        </p>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bottom Performer</h3>
        <p className="text-2xl font-bold text-red-600">
          {summaryStats.bottomPerformers[0]?.symbol}: {summaryStats.bottomPerformers[0]?.ytd.toFixed(2)}%
        </p>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Best Sector</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {summaryStats.sectorStats[0]?.sector}: {summaryStats.sectorStats[0]?.avgYtd.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

export default SummaryStats; 