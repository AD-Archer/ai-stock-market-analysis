import React from 'react';
import { useStocks } from '../../context/stocks/StocksContext';

/**
 * StockFilters Component
 * 
 * Provides filtering controls for the stock data table including:
 * - Sector-based filtering through a dropdown menu
 * - Text-based search for stock symbols and company names
 * 
 * The component automatically generates the sector filter options based on
 * available stock data and maintains filter state through the StocksContext.
 * 
 * @component
 * @returns {JSX.Element} The rendered stock filters
 */
const StockFilters: React.FC = () => {
  const {
    stocks,
    sectorFilter,
    searchTerm,
    setSectorFilter,
    setSearchTerm,
  } = useStocks();

  /**
   * Generates a unique list of sectors from the stock data
   * Includes 'All' as the default option
   */
  const sectors = stocks.length 
    ? ['All', ...new Set(stocks.map(stock => stock.sector))]
    : ['All'];

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label htmlFor="sectorFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Filter by Sector
        </label>
        <select
          id="sectorFilter"
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-gray-900 dark:text-white bg-white dark:bg-gray-800"
        >
          {sectors.map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Search
        </label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by symbol or name..."
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>
    </div>
  );
};

export default StockFilters; 