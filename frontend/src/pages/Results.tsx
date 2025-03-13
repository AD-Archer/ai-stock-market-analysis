import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faDownload, faEye, faSpinner, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { getResults, getDownloadUrl, getMockData } from '../services/api';

interface ResultFile {
  name: string;
  date: string;
  size: number;
}

interface StockData {
  symbol: string;
  name: string;
  ytd: number;
  sector: string;
  industry: string;
  market_cap: string | number;
  pe_ratio: string | number;
  dividend_yield: string | number;
  price: number;
}

const Results: React.FC = () => {
  const [files, setFiles] = useState<ResultFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [stocksLoading, setStocksLoading] = useState<boolean>(true);
  const [stocksError, setStocksError] = useState<string | null>(null);
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([]);
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof StockData>('symbol');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await getResults();
        
        if (response.files) {
          setFiles(response.files);
          setError(null);
        } else {
          setError(response.message || 'Failed to load results');
          setFiles([]);
        }
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load results. Please try again later.');
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchStockData = async () => {
      try {
        setStocksLoading(true);
        const response = await getMockData();
        
        if (response.success && response.stocks) {
          setStocks(response.stocks);
          setStocksError(null);
        } else {
          setStocksError(response.message || 'Failed to load stock data');
          setStocks([]);
        }
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setStocksError('Failed to load stock data. Please try again later.');
        setStocks([]);
      } finally {
        setStocksLoading(false);
      }
    };

    fetchResults();
    fetchStockData();
  }, []);

  // Apply filters and sorting to stocks
  useEffect(() => {
    if (!stocks.length) {
      setFilteredStocks([]);
      return;
    }

    let result = [...stocks];

    // Apply sector filter
    if (sectorFilter !== 'All') {
      result = result.filter(stock => stock.sector === sectorFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        stock => 
          stock.symbol.toLowerCase().includes(term) || 
          stock.name.toLowerCase().includes(term) ||
          stock.industry.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle numeric vs string comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Convert to strings for comparison
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      return sortDirection === 'asc' 
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString);
    });

    setFilteredStocks(result);
  }, [stocks, sectorFilter, sortField, sortDirection, searchTerm]);

  // Get unique sectors for filter dropdown
  const sectors = stocks.length 
    ? ['All', ...new Set(stocks.map(stock => stock.sector))]
    : ['All'];

  // Handle sort column click
  const handleSort = (field: keyof StockData) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field: keyof StockData) => {
    if (sortField !== field) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  // Format market cap for display
  const formatMarketCap = (marketCap: string | number) => {
    const numValue = typeof marketCap === 'string' ? parseFloat(marketCap) : marketCap;
    
    if (isNaN(numValue)) return 'N/A';
    
    if (numValue >= 1e12) {
      return `$${(numValue / 1e12).toFixed(2)}T`;
    } else if (numValue >= 1e9) {
      return `$${(numValue / 1e9).toFixed(2)}B`;
    } else if (numValue >= 1e6) {
      return `$${(numValue / 1e6).toFixed(2)}M`;
    } else {
      return `$${numValue.toLocaleString()}`;
    }
  };

  // Calculate summary statistics
  const calculateSummaryStats = () => {
    if (!stocks.length) return null;

    // Calculate average YTD
    const avgYtd = stocks.reduce((sum, stock) => sum + stock.ytd, 0) / stocks.length;

    // Get top 3 performers
    const topPerformers = [...stocks]
      .sort((a, b) => b.ytd - a.ytd)
      .slice(0, 3);

    // Get bottom 3 performers
    const bottomPerformers = [...stocks]
      .sort((a, b) => a.ytd - b.ytd)
      .slice(0, 3);

    // Calculate sector performance
    const sectorPerformance: Record<string, { count: number, totalYtd: number }> = {};
    stocks.forEach(stock => {
      if (!sectorPerformance[stock.sector]) {
        sectorPerformance[stock.sector] = { count: 0, totalYtd: 0 };
      }
      sectorPerformance[stock.sector].count += 1;
      sectorPerformance[stock.sector].totalYtd += stock.ytd;
    });

    // Convert to array and calculate average
    const sectorStats = Object.entries(sectorPerformance).map(([sector, data]) => ({
      sector,
      avgYtd: data.totalYtd / data.count,
      count: data.count
    })).sort((a, b) => b.avgYtd - a.avgYtd);

    return {
      avgYtd,
      topPerformers,
      bottomPerformers,
      sectorStats
    };
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

        {stocksLoading ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faSpinner} className="text-3xl text-primary animate-spin mb-2" />
            <p className="text-gray-600 dark:text-gray-300">Loading stock data...</p>
          </div>
        ) : stocks.length === 0 ? (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
            No stock data found. Please fetch data from the home page first.
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            {summaryStats && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Overall Performance */}
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Overall Performance</h3>
                  <p className="text-gray-700 dark:text-gray-200">
                    Average YTD: <span className={summaryStats.avgYtd >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {summaryStats.avgYtd >= 0 ? '+' : ''}{summaryStats.avgYtd.toFixed(2)}%
                    </span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-200 mt-1">
                    Total Stocks: {stocks.length}
                  </p>
                </div>

                {/* Top Performers */}
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Top Performers</h3>
                  <ul className="space-y-1">
                    {summaryStats.topPerformers.map(stock => (
                      <li key={stock.symbol} className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-200">{stock.symbol} ({stock.name.split(' ')[0]})</span>
                        <span className="text-green-600 dark:text-green-400">+{stock.ytd.toFixed(2)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Performers */}
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Bottom Performers</h3>
                  <ul className="space-y-1">
                    {summaryStats.bottomPerformers.map(stock => (
                      <li key={stock.symbol} className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-200">{stock.symbol} ({stock.name.split(' ')[0]})</span>
                        <span className="text-red-600 dark:text-red-400">{stock.ytd.toFixed(2)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Sector Performance */}
            {summaryStats && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Sector Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {summaryStats.sectorStats.map(sector => (
                    <div key={sector.sector} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1">
                      <span className="text-gray-700 dark:text-gray-200">
                        {sector.sector} ({sector.count})
                      </span>
                      <span className={sector.avgYtd >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {sector.avgYtd >= 0 ? '+' : ''}{sector.avgYtd.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Search by symbol, name, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="sector-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sector
                </label>
                <select
                  id="sector-filter"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                >
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {filteredStocks.length} of {stocks.length} stocks
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th 
                      className="py-3 px-4 text-left cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort('symbol')}
                    >
                      Symbol {renderSortIndicator('symbol')}
                    </th>
                    <th 
                      className="py-3 px-4 text-left cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort('name')}
                    >
                      Company {renderSortIndicator('name')}
                    </th>
                    <th 
                      className="py-3 px-4 text-left cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort('price')}
                    >
                      Price {renderSortIndicator('price')}
                    </th>
                    <th 
                      className="py-3 px-4 text-left cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort('ytd')}
                    >
                      YTD (%) {renderSortIndicator('ytd')}
                    </th>
                    <th 
                      className="py-3 px-4 text-left cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort('sector')}
                    >
                      Sector {renderSortIndicator('sector')}
                    </th>
                    <th 
                      className="py-3 px-4 text-left cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort('industry')}
                    >
                      Industry {renderSortIndicator('industry')}
                    </th>
                    <th 
                      className="py-3 px-4 text-left cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort('market_cap')}
                    >
                      Market Cap {renderSortIndicator('market_cap')}
                    </th>
                    <th 
                      className="py-3 px-4 text-left cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort('pe_ratio')}
                    >
                      P/E Ratio {renderSortIndicator('pe_ratio')}
                    </th>
                    <th 
                      className="py-3 px-4 text-left cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort('dividend_yield')}
                    >
                      Div Yield (%) {renderSortIndicator('dividend_yield')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStocks.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <td className="py-3 px-4 font-medium">{stock.symbol}</td>
                      <td className="py-3 px-4">{stock.name}</td>
                      <td className="py-3 px-4">${stock.price.toLocaleString()}</td>
                      <td className={`py-3 px-4 ${stock.ytd >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {stock.ytd >= 0 ? '+' : ''}{stock.ytd.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4">{stock.sector}</td>
                      <td className="py-3 px-4">{stock.industry}</td>
                      <td className="py-3 px-4">{formatMarketCap(stock.market_cap)}</td>
                      <td className="py-3 px-4">{stock.pe_ratio}</td>
                      <td className="py-3 px-4">{stock.dividend_yield}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Analysis Results Section */}
      <div className="card bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
          <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-primary" />
          Analysis Results
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold mr-1">Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faSpinner} className="text-3xl text-primary animate-spin mb-2" />
            <p className="text-gray-600 dark:text-gray-300">Loading results...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
            No results found. Generate recommendations from the home page first.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Filename</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Size</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {files.map((file) => (
                  <tr key={file.name} className="hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <td className="py-3 px-4">{file.name}</td>
                    <td className="py-3 px-4">{formatDate(file.date)}</td>
                    <td className="py-3 px-4">{formatSize(file.size)}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Link
                          to={`/view/${encodeURIComponent(file.name)}`}
                          className="btn-primary text-xs py-1 px-2 rounded flex items-center"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-1" /> View
                        </Link>
                        <a
                          href={getDownloadUrl(file.name)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded flex items-center"
                          download
                        >
                          <FontAwesomeIcon icon={faDownload} className="mr-1" /> Download
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results; 