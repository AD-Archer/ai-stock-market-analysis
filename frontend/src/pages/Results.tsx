import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faDownload, faEye, faSpinner, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { getDownloadUrl } from '../services/api';
import { useResults } from '../context/ResultsContext';

const Results: React.FC = () => {
  const {
    files,
    loading,
    error,
    stocks,
    stocksLoading,
    stocksError,
    filteredStocks,
    sectorFilter,
    sortField,
    sortDirection,
    searchTerm,
    setSectorFilter,
    setSortField,
    setSortDirection,
    setSearchTerm,
    handleSort,
    formatDate,
    formatSize,
    formatMarketCap,
    calculateSummaryStats,
  } = useResults();

  // Get unique sectors for filter dropdown
  const sectors = stocks.length 
    ? ['All', ...new Set(stocks.map(stock => stock.sector))]
    : ['All'];

  // Render sort indicator
  const renderSortIndicator = (field: keyof typeof filteredStocks[0]) => {
    if (sortField !== field) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  const summaryStats = calculateSummaryStats();

  return (
    <div className="space-y-8">
      {/* Stock Data Section */}
      <div className="card bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
          <FontAwesomeIcon icon={faChartLine} className="mr-2 text-primary" />
          NASDAQ-100 Stock Data
        </h1>

        {stocksError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold mr-1">Error:</strong> {stocksError}
          </div>
        )}

        {/* Summary Statistics */}
        {summaryStats && (
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
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="sectorFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Sector
            </label>
            <select
              id="sectorFilter"
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
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
              placeholder="Search by symbol, name, or industry..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Stock Table */}
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
                filteredStocks.map((stock) => (
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
      </div>

      {/* Results Files Section */}
      <div className="card bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
          <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-primary" />
          Analysis Results
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold mr-1">Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-primary" />
          </div>
        ) : files.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No results available</p>
        ) : (
          <div className="space-y-4">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{file.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(file.date)} • {formatSize(file.size)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/view/${file.name}`}
                    className="btn btn-secondary"
                  >
                    <FontAwesomeIcon icon={faEye} className="mr-2" />
                    View
                  </Link>
                  <a
                    href={getDownloadUrl(file.name)}
                    download
                    className="btn btn-primary"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Results; 