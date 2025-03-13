import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faDownload } from '@fortawesome/free-solid-svg-icons';
import { viewRecommendation, getDownloadUrl } from '../services/api';

const ViewRecommendation: React.FC = () => {
  const { filename } = useParams<{ filename: string }>();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!filename) {
        setError('No filename provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await viewRecommendation(filename);
        
        if (response.success) {
          setContent(response.content);
          setError(null);
        } else {
          setError(response.message || 'Failed to load recommendation');
        }
      } catch (err) {
        console.error('Error fetching recommendation:', err);
        setError('Failed to load recommendation. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [filename]);

  return (
    <div className="view-recommendation-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          {filename ? decodeURIComponent(filename) : 'View Recommendation'}
        </h1>
        <div className="btn-group">
          <Link to="/results" className="btn btn-secondary">
            <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Back to Results
          </Link>
          {filename && (
            <a
              href={getDownloadUrl(filename)}
              className="btn btn-success"
              download
            >
              <FontAwesomeIcon icon={faDownload} className="me-1" /> Download
            </a>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading recommendation...</p>
        </div>
      ) : content ? (
        <div className="card">
          <div className="card-body">
            <pre className="recommendation-content">{content}</pre>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ViewRecommendation; 