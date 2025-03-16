import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import SummaryStats from '../components/stock/SummaryStats';
import StockFilters from '../components/stock/StockFilters';
import StockTable from '../components/stock/StockTable';
import AIAnalysisSection from '../components/AIAnalysisSection';
import ResultsFilesSection from '../components/ResultsFilesSection';
import { StocksProvider } from '../context/stocks/StocksContext';
import { AIProvider } from '../context/ai/AIContext';

/**
 * Results Page Component
 * 
 * Displays comprehensive stock market analysis results including:
 * - NASDAQ-100 stock data table with filtering capabilities
 * - Summary statistics of the analyzed stocks
 * - AI-powered analysis and recommendations
 * - Generated analysis files and reports
 * 
 * This component is wrapped with StocksProvider and AIProvider to manage
 * stock data and AI analysis state respectively.
 * 
 * @component
 * @returns {JSX.Element} The rendered Results page
 */
const Results: React.FC = () => {
  return (
    <StocksProvider>
      <AIProvider>
        <div className="space-y-8">
          {/* Stock Data Section - Main section displaying stock information and filters */}
          <div className="card bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
              <FontAwesomeIcon icon={faChartLine} className="mr-2 text-primary" />
              NASDAQ-100 Stock Data(This is out of data, please supply your own stock data for an accurate analysis)
            </h1>

            <SummaryStats />
            <StockFilters />
            <StockTable />
          </div>

          <AIAnalysisSection />
          <ResultsFilesSection />
        </div>
      </AIProvider>
    </StocksProvider>
  );
};

export default Results; 