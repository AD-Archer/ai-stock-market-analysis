import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faHome, faChartBar } from '@fortawesome/free-solid-svg-icons';

interface NavbarProps {
  apiStatus: string;
}

const Navbar: React.FC<NavbarProps> = ({ apiStatus }) => {
  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <FontAwesomeIcon icon={faChartLine} className="me-2" />
          Stock Market Analysis
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                to="/"
              >
                <FontAwesomeIcon icon={faHome} className="me-1" /> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === '/results' ? 'active' : ''}`}
                to="/results"
              >
                <FontAwesomeIcon icon={faChartBar} className="me-1" /> Results
              </Link>
            </li>
            <li className="nav-item">
              <span className={`nav-link ${apiStatus === 'online' ? 'text-success' : apiStatus === 'offline' ? 'text-danger' : 'text-warning'}`}>
                API: {apiStatus}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 