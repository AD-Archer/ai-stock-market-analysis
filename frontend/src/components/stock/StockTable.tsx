import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useStocks } from '../../context/stocks/StocksContext';

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

const StockTable: React.FC = () => {
  const {
    filteredStocks,
    stocksLoading,
    sortField,
    sortDirection,
    handleSort,
    formatMarketCap,
  } = useStocks();

  // Render sort indicator
  const renderSortIndicator = (field: keyof Stock) => {
    if (sortField !== field) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('symbol')}
            >
              Symbol {renderSortIndicator('symbol')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('name')}
            >
              Name {renderSortIndicator('name')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('ytd')}
            >
              YTD % {renderSortIndicator('ytd')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('sector')}
            >
              Sector {renderSortIndicator('sector')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('market_cap')}
            >
              Market Cap {renderSortIndicator('market_cap')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('pe_ratio')}
            >
              P/E Ratio {renderSortIndicator('pe_ratio')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('dividend_yield')}
            >
              Dividend Yield {renderSortIndicator('dividend_yield')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('price')}
            >
              Price {renderSortIndicator('price')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {stocksLoading ? (
            <tr>
              <td colSpan={8} className="px-6 py-4 text-center">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-primary" />
              </td>
            </tr>
          ) : filteredStocks.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No stocks found
              </td>
            </tr>
          ) : (
            filteredStocks.map((stock: Stock) => (
              <tr key={stock.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {stock.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {stock.name}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  stock.ytd >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stock.ytd.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {stock.sector}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatMarketCap(stock.market_cap)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {stock.pe_ratio}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {stock.dividend_yield}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  ${stock.price.toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable; 