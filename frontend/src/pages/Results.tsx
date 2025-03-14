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

const Results: React.FC = () => {
  return (
    <StocksProvider>
      <AIProvider>
        <div className="space-y-8">
          {/* Stock Data Section */}
          <div className="card bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
              <FontAwesomeIcon icon={faChartLine} className="mr-2 text-primary" />
              NASDAQ-100 Stock Data
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