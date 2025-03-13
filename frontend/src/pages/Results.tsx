import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faDownload, faEye } from '@fortawesome/free-solid-svg-icons';
import { getResults, getDownloadUrl } from '../services/api';

interface ResultFile {
  name: string;
  date: string;
  size: number;
}

const Results: React.FC = () => {
  const [files, setFiles] = useState<ResultFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await getResults();
        setFiles(response.files);
        setError(null);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  return (
    <div className="results-page">
      <h1 className="mb-4">
        <FontAwesomeIcon icon={faFileAlt} className="me-2" />
        Analysis Results
      </h1>

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
          <p className="mt-2">Loading results...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="alert alert-info">
          No results found. Generate recommendations from the home page first.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Filename</th>
                <th>Date</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.name}>
                  <td>{file.name}</td>
                  <td>{formatDate(file.date)}</td>
                  <td>{formatSize(file.size)}</td>
                  <td>
                    <div className="btn-group">
                      <Link
                        to={`/view/${encodeURIComponent(file.name)}`}
                        className="btn btn-sm btn-primary"
                      >
                        <FontAwesomeIcon icon={faEye} className="me-1" /> View
                      </Link>
                      <a
                        href={getDownloadUrl(file.name)}
                        className="btn btn-sm btn-success"
                        download
                      >
                        <FontAwesomeIcon icon={faDownload} className="me-1" /> Download
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Results; 