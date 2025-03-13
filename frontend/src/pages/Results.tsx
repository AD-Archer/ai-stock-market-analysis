import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faDownload, faEye, faSpinner } from '@fortawesome/free-solid-svg-icons';
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
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-primary" />
        Analysis Results
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold mr-1">Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <FontAwesomeIcon icon={faSpinner} className="text-3xl text-primary animate-spin mb-2" />
          <p className="text-gray-600 dark:text-gray-300">Loading results...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
          No results found. Generate recommendations from the home page first.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Filename</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Size</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {files.map((file) => (
                <tr key={file.name} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                  <td className="py-3 px-4">{file.name}</td>
                  <td className="py-3 px-4">{formatDate(file.date)}</td>
                  <td className="py-3 px-4">{formatSize(file.size)}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Link
                        to={`/view/${encodeURIComponent(file.name)}`}
                        className="btn-primary text-xs py-1 px-2 rounded flex items-center"
                      >
                        <FontAwesomeIcon icon={faEye} className="mr-1" /> View
                      </Link>
                      <a
                        href={getDownloadUrl(file.name)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded flex items-center"
                        download
                      >
                        <FontAwesomeIcon icon={faDownload} className="mr-1" /> Download
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