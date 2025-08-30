import { createContext } from 'react';

export interface ResultFile {
  name: string;
  date: string;
  size: number;
}

export interface StockData {
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

export interface ResultsContextType {
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

export const ResultsContext = createContext<ResultsContextType | undefined>(undefined);
