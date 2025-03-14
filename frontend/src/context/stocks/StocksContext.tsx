import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface StocksContextType {
  stocks: Stock[];
  loading: boolean;
  error: string | null;
  filteredStocks: Stock[];
  sectorFilter: string;
  sortField: keyof Stock | '';
  sortDirection: 'asc' | 'desc';
  searchTerm: string;
  setSectorFilter: (sector: string) => void;
  setSearchTerm: (term: string) => void;
  handleSort: (field: keyof Stock) => void;
  formatMarketCap: (value: number) => string;
  calculateSummaryStats: () => {
    avgYtd: number;
    topPerformers: Stock[];
    bottomPerformers: Stock[];
    sectorStats: { sector: string; avgYtd: number }[];
  };
}

const StocksContext = createContext<StocksContextType | undefined>(undefined);

export const useStocks = () => {
  const context = useContext(StocksContext);
  if (!context) {
    throw new Error('useStocks must be used within a StocksProvider');
  }
  return context;
};

export const StocksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState('All');
  const [sortField, setSortField] = useState<keyof Stock | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch stocks data
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch('/api/stocks');
        const data = await response.json();
        setStocks(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stocks');
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  // Filter and sort stocks
  const filteredStocks = React.useMemo(() => {
    let filtered = [...stocks];

    // Apply sector filter
    if (sectorFilter !== 'All') {
      filtered = filtered.filter(stock => stock.sector === sectorFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(stock =>
        stock.symbol.toLowerCase().includes(searchLower) ||
        stock.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return sortDirection === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });
    }

    return filtered;
  }, [stocks, sectorFilter, searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof Stock) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatMarketCap = (value: number): string => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  const calculateSummaryStats = () => {
    if (stocks.length === 0) return null;

    const avgYtd = stocks.reduce((sum, stock) => sum + stock.ytd, 0) / stocks.length;
    const sortedByYtd = [...stocks].sort((a, b) => b.ytd - a.ytd);
    const topPerformers = sortedByYtd.slice(0, 3);
    const bottomPerformers = sortedByYtd.slice(-3).reverse();

    const sectorStats = Object.entries(
      stocks.reduce((acc, stock) => {
        if (!acc[stock.sector]) {
          acc[stock.sector] = { total: 0, count: 0 };
        }
        acc[stock.sector].total += stock.ytd;
        acc[stock.sector].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>)
    )
      .map(([sector, { total, count }]) => ({
        sector,
        avgYtd: total / count,
      }))
      .sort((a, b) => b.avgYtd - a.avgYtd);

    return {
      avgYtd,
      topPerformers,
      bottomPerformers,
      sectorStats,
    };
  };

  const value = {
    stocks,
    loading,
    error,
    filteredStocks,
    sectorFilter,
    sortField,
    sortDirection,
    searchTerm,
    setSectorFilter,
    setSearchTerm,
    handleSort,
    formatMarketCap,
    calculateSummaryStats,
  };

  return (
    <StocksContext.Provider value={value}>
      {children}
    </StocksContext.Provider>
  );
}; 