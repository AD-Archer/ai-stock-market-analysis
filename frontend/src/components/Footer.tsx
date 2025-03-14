import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

/**
 * Footer Component
 * 
 * A responsive footer component that displays:
 * - Application branding with icon
 * - Dynamic copyright year
 * 
 * The footer is styled to stick to the bottom of the page and
 * maintains consistent spacing and alignment across screen sizes.
 * 
 * @component
 * @returns {JSX.Element} The rendered footer
 */
const Footer: React.FC = () => {
  /** Get the current year for the copyright notice */
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