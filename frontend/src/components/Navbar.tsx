import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faHome, faChartBar, faBars, faXmark } from '@fortawesome/free-solid-svg-icons';

interface NavbarProps {
  apiStatus: string;
}

const Navbar: React.FC<NavbarProps> = ({ apiStatus }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to get the right status indicator class
  const getStatusClass = () => {
    if (apiStatus === 'online') return 'status-indicator status-online';
    if (apiStatus === 'offline') return 'status-indicator status-offline';
    return 'status-indicator bg-yellow-100 text-yellow-600';
  };

  return (
    <nav className="bg-gray-800 shadow-lg sticky top-0 z-10 w-full">
      <div className="w-full max-w-7xl mx-auto px-3 md:px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo and brand name */}
          <Link className="flex items-center text-white font-bold text-lg" to="/">
            <FontAwesomeIcon icon={faChartLine} className="mr-2 text-blue-400" />
            <span>Stock Market Analysis</span>
          </Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} className="h-5 w-5" />
            </button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              to="/"
            >
              <FontAwesomeIcon icon={faHome} className="mr-1" /> Home
            </Link>
            <Link
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/results' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              to="/results"
            >
              <FontAwesomeIcon icon={faChartBar} className="mr-1" /> Results
            </Link>
            <span className={getStatusClass()}>
              API: {apiStatus}
            </span>
          </div>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        {isMenuOpen && (
          <div className="md:hidden py-2 space-y-1 pb-3">
            <Link
              className={`block px-3 py-1.5 rounded-md text-sm font-medium ${
                location.pathname === '/' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              to="/"
              onClick={() => setIsMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faHome} className="mr-1" /> Home
            </Link>
            <Link
              className={`block px-3 py-1.5 rounded-md text-sm font-medium ${
                location.pathname === '/results' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              to="/results"
              onClick={() => setIsMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faChartBar} className="mr-1" /> Results
            </Link>
            <span className={`block px-3 py-1.5 rounded-md text-sm font-medium ${getStatusClass()}`}>
              API: {apiStatus}
            </span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 