import React, { useState, useEffect } from 'react';
import { getResults, getMockData } from '../services/api';
import { ResultsContext, ResultFile, StockData } from './ResultsContextBase.tsx';

/**
 * Result File Interface
 * 
 * @interface ResultFile
 * @property {string} name - File name
 * @property {string} date - Creation/modification date
 * @property {number} size - File size in bytes
 */
// Types moved to ResultsContextBase

/**
 * Stock Data Interface
 * 
 * @interface StockData
 * @property {string} symbol - Stock ticker symbol
 * @property {string} name - Company name
 * @property {number} ytd - Year-to-date performance percentage
 * @property {string} sector - Business sector
 * @property {string} industry - Business industry
 * @property {string | number} market_cap - Market capitalization
 * @property {string | number} pe_ratio - Price-to-earnings ratio
 * @property {string | number} dividend_yield - Dividend yield percentage
 * @property {number} price - Current stock price
 */
// Types moved to ResultsContextBase

/**
 * Results Context Type Definition
 * 
 * @interface ResultsContextType
 * @property {ResultFile[]} files - Array of result files
 * @property {boolean} loading - Files loading state
 * @property {string | null} error - Files error message
 * @property {StockData[]} stocks - Array of stock data
 * @property {boolean} stocksLoading - Stocks loading state
 * @property {string | null} stocksError - Stocks error message
 * @property {StockData[]} filteredStocks - Filtered and sorted stocks
 * @property {string} sectorFilter - Current sector filter
 * @property {keyof StockData} sortField - Current sort field
 * @property {'asc' | 'desc'} sortDirection - Current sort direction
 * @property {string} searchTerm - Current search term
 * @property {function} setSectorFilter - Updates sector filter
 * @property {function} setSortField - Updates sort field
 * @property {function} setSortDirection - Updates sort direction
 * @property {function} setSearchTerm - Updates search term
 * @property {function} handleSort - Handles column sorting
 * @property {function} formatDate - Formats date strings
 * @property {function} formatSize - Formats file sizes
 * @property {function} formatMarketCap - Formats market cap values
 * @property {function} calculateSummaryStats - Calculates stock statistics
 */
// Context moved to ResultsContextBase

/**
 * Results Context Provider
 * 
 * Manages the results and stock data state including:
 * - Result files listing and operations
 * - Stock data fetching and storage
 * - Data filtering and sorting
 * - Formatting utilities
 * - Statistics calculation
 * 
 * Provides real-time filtering and sorting of stock data
 * and automatic data fetching on mount.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with the provider
 * @returns {JSX.Element} The provider component
 */
export const ResultsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    let isMounted = true;
    
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await getResults();
        
        if (response.files && isMounted) {
          setFiles(response.files);
          setError(null);
        } else if (isMounted) {
          setError(response.message || 'Failed to load results');
          setFiles([]);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching results:', err);
          setError('Failed to load results. Please try again later.');
          setFiles([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchStockData = async () => {
      try {
        setStocksLoading(true);
        const response = await getMockData();
        
        if (response.success && response.stocks && isMounted) {
          setStocks(response.stocks);
          setStocksError(null);
        } else if (isMounted) {
          setStocksError(response.message || 'Failed to load stock data');
          setStocks([]);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching stock data:', err);
          setStocksError('Failed to load stock data. Please try again later.');
          setStocks([]);
        }
      } finally {
        if (isMounted) {
          setStocksLoading(false);
        }
      }
    };

    // Only fetch once when component mounts
    fetchResults();
    fetchStockData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once

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

  return (
    <ResultsContext.Provider
      value={{
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
      }}
    >
      {children}
    </ResultsContext.Provider>
  );
};

/**
 * Custom hook for accessing the results context
 * 
 * @function useResults
 * @returns {ResultsContextType} The results context value
 * @throws {Error} If used outside of ResultsProvider
 */
// Hook moved to separate file useResults.ts for react-refresh compliance