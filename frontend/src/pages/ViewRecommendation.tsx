import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons';
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
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">
          {filename ? decodeURIComponent(filename) : 'View Recommendation'}
        </h1>
        <div className="flex space-x-2">
          <Link to="/results" className="btn-secondary flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-1" /> Back to Results
          </Link>
          {filename && (
            <a
              href={getDownloadUrl(filename)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
              download
            >
              <FontAwesomeIcon icon={faDownload} className="mr-1" /> Download
            </a>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold mr-1">Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-primary animate-spin mb-3" />
          <p className="text-gray-600 dark:text-gray-300">Loading recommendation...</p>
        </div>
      ) : content ? (
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
          <pre className="recommendation-content">{content}</pre>
        </div>
      ) : null}
    </div>
  );
};

export default ViewRecommendation; 