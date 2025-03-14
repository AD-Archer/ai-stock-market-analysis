import React, { createContext, useContext, useState, useEffect } from 'react';
import { getResults, getMockData } from '../services/api';

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

interface ResultsContextType {
  files: ResultFile[];
  loading: boolean;
  error: string | null;
  stocks: StockData[];
  stocksLoading: boolean;
  stocksError: string | null;
  filteredStocks: StockData[];
  sectorFilter: string;
  sortField: keyof StockData;
  sortDirection: 'asc' | 'desc';
  searchTerm: string;
  setSectorFilter: (value: string) => void;
  setSortField: (value: keyof StockData) => void;
  setSortDirection: (value: 'asc' | 'desc') => void;
  setSearchTerm: (value: string) => void;
  handleSort: (field: keyof StockData) => void;
  formatDate: (dateString: string) => string;
  formatSize: (bytes: number) => string;
  formatMarketCap: (marketCap: string | number) => string;
  calculateSummaryStats: () => {
    avgYtd: number;
    topPerformers: StockData[];
    bottomPerformers: StockData[];
    sectorStats: Array<{
      sector: string;
      avgYtd: number;
      count: number;
    }>;
  } | null;
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

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

export const useResults = () => {
  const context = useContext(ResultsContext);
  if (context === undefined) {
    throw new Error('useResults must be used within a ResultsProvider');
  }
  return context;
}; 