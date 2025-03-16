import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faDownload, faSpinner, faPrint, faMoon, faSun, faClock } from '@fortawesome/free-solid-svg-icons';
import { getDownloadUrl } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import '../styles/markdown.css';
import '../styles/recommendation.css';
import { useRecommendation } from '../context/RecommendationContext';

const ViewRecommendation: React.FC = () => {
  const { filename } = useParams<{ filename: string }>();
  const [formattedDate, setFormattedDate] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);
  const {
    content,
    loading,
    error,
    darkMode,
    fileMetadata,
    handlePrint,
    toggleDarkMode,
    fetchContent,
  } = useRecommendation();

  // Fetch content only once when component mounts or filename changes
  useEffect(() => {
    if (filename) {
      fetchContent(filename);
    }
  }, [filename, fetchContent]);

  // Format the date whenever fileMetadata changes
  useEffect(() => {
    if (fileMetadata?.date) {
      const date = new Date(fileMetadata.date);
      setFormattedDate(
        date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    }
  }, [fileMetadata]);

  // Render content as markdown or plain text
  const renderedContent = React.useMemo(() => {
    // Custom components for markdown rendering
    const markdownComponents: Components = {
      // Style headings
      h1: ({children, ...props}) => <h1 className="text-2xl font-bold my-4" {...props}>{children}</h1>,
      h2: ({children, ...props}) => <h2 className="text-xl font-bold my-3" {...props}>{children}</h2>,
      h3: ({children, ...props}) => <h3 className="text-lg font-bold my-2" {...props}>{children}</h3>,
      h4: ({children, ...props}) => <h4 className="text-base font-bold my-2" {...props}>{children}</h4>,
      // Style paragraphs
      p: ({children, ...props}) => <p className="my-2" {...props}>{children}</p>,
      // Style lists
      ul: ({children, ...props}) => <ul className="list-disc pl-6 my-2" {...props}>{children}</ul>,
      ol: ({children, ...props}) => <ol className="list-decimal pl-6 my-2" {...props}>{children}</ol>,
      // Style links
      a: ({children, ...props}) => <a className="text-blue-500 hover:underline" {...props}>{children}</a>,
      // Style code blocks
      code: ({className, children, ...props}) => (
        <code className={`${className || ''} bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm`} {...props}>
          {children}
        </code>
      ),
      // Style blockquotes
      blockquote: ({children, ...props}) => (
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 my-4 italic" {...props}>
          {children}
        </blockquote>
      ),
      // Style tables
      table: ({children, ...props}) => (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
            {children}
          </table>
        </div>
      ),
      // Style table headers
      th: ({children, ...props}) => (
        <th className="px-3 py-2 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" {...props}>
          {children}
        </th>
      ),
      // Style table cells
      td: ({children, ...props}) => (
        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700" {...props}>
          {children}
        </td>
      ),
      // Style horizontal rule
      hr: () => <hr className="my-6 border-t-2 border-gray-200 dark:border-gray-700" />,
    };

    if (content) {
      // Check if content is markdown (has markdown syntax)
      const isMarkdown = /[#*`[\]()\\n\\r]/.test(content);
      
      if (isMarkdown) {
        return (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        );
      } else {
        // Render as plain text with line breaks
        const lines = content.split('\n');
        return (
          <div className="whitespace-pre-wrap">
            {lines.map((line, index) => {
              // Check if line is a heading (starts with # in plain text)
              if (line.startsWith('# ')) {
                return <h1 key={index} className="text-2xl font-bold my-4">{line.substring(2)}</h1>;
              } else if (line.startsWith('## ')) {
                return <h2 key={index} className="text-xl font-bold my-3">{line.substring(3)}</h2>;
              } else if (line.startsWith('### ')) {
                return <h3 key={index} className="text-lg font-bold my-2">{line.substring(4)}</h3>;
              } else if (line.trim() === '') {
                return <br key={index} />;
              } else {
                return <p key={index} className="my-1">{line}</p>;
              }
            })}
          </div>
        );
      }
    }
  }, [content]);

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {filename ? decodeURIComponent(filename) : 'View Recommendation'}
          </h1>
          {formattedDate && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
              <FontAwesomeIcon icon={faClock} className="mr-1" /> 
              Created: {formattedDate}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/results" className="btn-secondary flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-1" /> Back to Results
          </Link>
          
          {filename && (
            <>
              <a
                href={getDownloadUrl(filename)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                download
              >
                <FontAwesomeIcon icon={faDownload} className="mr-1" /> Download
              </a>
              
              <button
                onClick={handlePrint}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <FontAwesomeIcon icon={faPrint} className="mr-1" /> Print
              </button>
              
              <button
                onClick={toggleDarkMode}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                <FontAwesomeIcon icon={darkMode ? faSun : faMoon} className="mr-1" />
                {darkMode ? "Light" : "Dark"}
              </button>
            </>
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
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden print:shadow-none print:border-0">
          <div 
            ref={contentRef}
            className="recommendation-content p-6 text-gray-800 dark:text-gray-200 overflow-auto max-h-[70vh] print:max-h-none"
            style={{ overflowAnchor: 'none' }} // Prevent scroll anchoring
          >
            {renderedContent}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default React.memo(ViewRecommendation); // Memoize the entire component to prevent unnecessary re-renders 