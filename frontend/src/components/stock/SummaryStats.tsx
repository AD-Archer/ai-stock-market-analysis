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
interface SummaryStatsProps {
  variant?: 'default' | 'compact';
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ variant = 'default' }) => {
  const { calculateSummaryStats, loading } = useStocks();
  
  if (loading) {
    return (
      <div className={`grid ${variant === 'compact' ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'} gap-3 mb-4`}>
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg animate-pulse border border-gray-200 dark:border-gray-700">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  
  const summaryStats = calculateSummaryStats();

  if (!summaryStats) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
        <p className="text-yellow-800 dark:text-yellow-200">No stock data available for summary statistics.</p>
      </div>
    );
  }

  const cards = [
    {
      label: 'Average YTD',
      value: `${summaryStats.avgYtd.toFixed(2)}%`,
      tone: 'neutral'
    },
    {
      label: 'Top Performer',
      value: `${summaryStats.topPerformers[0]?.symbol || 'N/A'} · ${(summaryStats.topPerformers[0]?.ytd.toFixed(2) || '0.00')}%`,
      tone: 'positive'
    },
    {
      label: 'Bottom Performer',
      value: `${summaryStats.bottomPerformers[0]?.symbol || 'N/A'} · ${(summaryStats.bottomPerformers[0]?.ytd.toFixed(2) || '0.00')}%`,
      tone: 'negative'
    },
    {
      label: 'Best Sector',
      value: `${summaryStats.sectorStats[0]?.sector || 'N/A'} · ${(summaryStats.sectorStats[0]?.avgYtd.toFixed(2) || '0.00')}%`,
      tone: 'neutral'
    }
  ];

  return (
    <div className={`grid ${variant === 'compact' ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'} mb-${variant === 'compact' ? '4' : '6'}`}>
      {cards.map((c) => (
        <div
          key={c.label}
          className={`relative overflow-hidden rounded-lg border backdrop-blur-sm ${
            variant === 'compact' ? 'p-3 text-xs' : 'p-4'
          } bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700 shadow-sm`}
        >
          <div className="flex items-start justify-between">
            <h3 className={`font-medium ${variant === 'compact' ? 'text-[11px]' : 'text-sm'} text-gray-500 dark:text-gray-400`}>{c.label}</h3>
            <span className={`w-2 h-2 rounded-full mt-0.5 ${
              c.tone === 'positive' ? 'bg-green-500 animate-pulse' : c.tone === 'negative' ? 'bg-red-500 animate-pulse' : 'bg-blue-400'
            }`} />
          </div>
          <p className={`${variant === 'compact' ? 'text-sm mt-1' : 'text-xl mt-2'} font-semibold ${
            c.tone === 'positive' ? 'text-green-600 dark:text-green-400' : c.tone === 'negative' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
          }`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryStats; 