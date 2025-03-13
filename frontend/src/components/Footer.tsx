import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 py-4 mt-auto border-t border-gray-700 w-full">
      <div className="w-full max-w-7xl mx-auto px-3 md:px-4 flex justify-between items-center text-sm">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faChartLine} className="mr-2 text-blue-400" />
          <span>Stock Market Analysis</span>
        </div>
        <div>&copy; {currentYear}</div>
      </div>
    </footer>
  );
};

export default Footer; 