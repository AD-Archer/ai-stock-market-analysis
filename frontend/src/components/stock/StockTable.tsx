import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useStocks } from '../../context/stocks/StocksContext';

/**
 * Stock interface representing the structure of stock data
 * @interface Stock
 * @property {string} symbol - The stock's ticker symbol
 * @property {string} name - The company name
 * @property {number} ytd - Year-to-date performance percentage
 * @property {string} sector - The company's business sector
 * @property {number} market_cap - Market capitalization in USD
 * @property {number} pe_ratio - Price-to-earnings ratio
 * @property {number} dividend_yield - Dividend yield percentage
 * @property {number} price - Current stock price in USD
 */
interface Stock {
  symbol: string;
  name: string;
  ytd: number;
  sector: string;
  market_cap: number;
  pe_ratio: number;
  dividend_yield: number;
  price: number;
}

/**
 * StockTable Component
 * 
 * Displays a sortable table of stock data with the following features:
 * - Sortable columns for all stock metrics
 * - Loading state indication
 * - Formatted market cap values
 * - Visual sort direction indicators
 * 
 * Uses the StocksContext for data management and sorting functionality.
 * 
 * @component
 * @returns {JSX.Element} The rendered stock table
 */
const StockTable: React.FC = () => {
  const {
    filteredStocks,
    loading,
    sortField,
    sortDirection,
    handleSort,
    formatMarketCap,
  } = useStocks();

  /**
   * Renders a sort direction indicator (▲ or ▼) for the currently sorted column
   * @param {keyof Stock} field - The field to check for sort status
   * @returns {JSX.Element | null} The sort indicator element or null if not sorted
   */
  const renderSortIndicator = (field: keyof Stock) => {
    if (sortField !== field) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('symbol')}
              >
                <div className="flex items-center">
                  Symbol {renderSortIndicator('symbol')}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name {renderSortIndicator('name')}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('ytd')}
              >
                <div className="flex items-center">
                  YTD % {renderSortIndicator('ytd')}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('sector')}
              >
                <div className="flex items-center">
                  Sector {renderSortIndicator('sector')}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('market_cap')}
              >
                <div className="flex items-center">
                  Market Cap {renderSortIndicator('market_cap')}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('pe_ratio')}
              >
                <div className="flex items-center">
                  P/E Ratio {renderSortIndicator('pe_ratio')}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('dividend_yield')}
              >
                <div className="flex items-center">
                  Dividend Yield {renderSortIndicator('dividend_yield')}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center">
                  Price {renderSortIndicator('price')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-500 dark:text-gray-400">Loading stocks...</span>
                  </div>
                </td>
              </tr>
            ) : filteredStocks.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No stocks found matching your criteria
                </td>
              </tr>
            ) : (
              filteredStocks.map((stock: Stock) => (
                <tr key={stock.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {stock.symbol}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    <span title={stock.name}>{stock.name}</span>
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm font-semibold ${
                    stock.ytd >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.ytd.toFixed(2)}%
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {stock.sector}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatMarketCap(stock.market_cap)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {stock.pe_ratio}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {stock.dividend_yield}%
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${stock.price.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockTable; 