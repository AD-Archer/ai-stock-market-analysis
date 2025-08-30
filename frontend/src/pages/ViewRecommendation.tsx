import React, { useEffect, useState, useRef, useMemo, useLayoutEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faDownload, faSpinner, faPrint, faClock } from '@fortawesome/free-solid-svg-icons';
import { getDownloadUrl, getResults } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { useRecommendation } from '../hooks/useRecommendation';
import { Helmet } from 'react-helmet-async';
import { matchSlugToFilename, generateSlug } from '../utils/slug';
import SummaryStats from '../components/stock/SummaryStats';
import StockFilters from '../components/stock/StockFilters';
import StockTable from '../components/stock/StockTable';
import { StocksProvider } from '../context/stocks/StocksContext';

const ViewRecommendation: React.FC = () => {
  const { filename: slugParam } = useParams<{ filename: string }>();
  const [actualFilename, setActualFilename] = useState<string | null>(null);
  const [formattedDate, setFormattedDate] = useState<string>('');
  const lastResolvedSlug = useRef<string | null>(null);
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);

  const { content, loading, error, fileMetadata, handlePrint, fetchContent } = useRecommendation();

  // Resolve slug to real filename
  useEffect(() => {
    const resolve = async () => {
      if (!slugParam) return;
      if (slugParam === lastResolvedSlug.current) return;
      try {
        const results = await getResults();
        const files: Array<{ name: string; date: string; size?: number }> = results.files || [];
        let mapped: string | null = null;

        // 1. Existing matching logic
        if (files.length) {
          mapped = matchSlugToFilename(slugParam, files);
        }

        // 2. Try matching by recomputing slug from each file + date (case-insensitive)
        if (!mapped && files.length) {
          const lowerSlug = slugParam.toLowerCase();
          for (const f of files) {
            const calculated = generateSlug(f.name, f.date).toLowerCase();
            if (calculated === lowerSlug) {
              mapped = f.name;
              break;
            }
          }
        }

        // 3. If slug looks like a direct filename (contains a dot extension) see if file exists
        if (!mapped && /\.[a-z0-9]+$/i.test(slugParam)) {
          const direct = files.find(f => f.name === slugParam || f.name.toLowerCase() === slugParam.toLowerCase());
          if (direct) mapped = direct.name;
        }

        // 4. Last resort: case-insensitive startsWith on base name
        if (!mapped) {
          const base = slugParam.split('-')[0].toLowerCase();
          const candidate = files.find(f => f.name.toLowerCase().startsWith(base));
          if (candidate) mapped = candidate.name;
        }

        if (mapped) {
          lastResolvedSlug.current = slugParam;
          setActualFilename(mapped);
        } else {
          console.warn('Slug could not be resolved to a file:', slugParam);
        }
      } catch (e) {
        console.error('Unable to resolve slug', e);
      }
    };
    resolve();
  }, [slugParam]);

  // Fetch content when actual filename is determined
  useEffect(() => {
    if (actualFilename) {
      fetchContent(actualFilename);
    }
  }, [actualFilename, fetchContent]);

  // Format display date
  useEffect(() => {
    if (fileMetadata?.date) {
      const date = new Date(fileMetadata.date);
      setFormattedDate(date.toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      }));
    }
  }, [fileMetadata]);

  // Markdown rendering
  const renderedContent = useMemo(() => {
    if (!content) return null;
    const markdownComponents: Components = {
      h1: ({ children, ...props }) => <h1 className="text-2xl font-bold mb-3 mt-6 border-b-2 border-blue-500 pb-2" {...props}>{children}</h1>,
      h2: ({ children, ...props }) => <h2 className="text-xl font-bold mb-2 mt-5 border-b pb-1" {...props}>{children}</h2>,
      h3: ({ children, ...props }) => <h3 className="text-lg font-bold mb-2 mt-4" {...props}>{children}</h3>,
      h4: ({ children, ...props }) => <h4 className="text-base font-bold mb-1 mt-3" {...props}>{children}</h4>,
      p: ({ children, ...props }) => <p className="mb-3 leading-relaxed" {...props}>{children}</p>,
      ul: ({ children, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props}>{children}</ul>,
      ol: ({ children, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props}>{children}</ol>,
      li: ({ children, ...props }) => <li className="" {...props}>{children}</li>,
      a: ({ children, ...props }) => <a className="text-blue-600 hover:text-blue-800 hover:underline font-medium" {...props}>{children}</a>,
      code: ({ className, children, ...props }) => <code className={`${className || ''} bg-gray-100 px-2 py-1 rounded text-sm font-mono border`} {...props}>{children}</code>,
      pre: ({ children, ...props }) => <pre className="bg-gray-50 border rounded-lg p-4 mb-4 overflow-x-auto text-sm" {...props}>{children}</pre>,
      blockquote: ({ children, ...props }) => <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 italic bg-blue-50" {...props}>{children}</blockquote>,
      table: ({ children, ...props }) => <div className="overflow-x-auto mb-4"><table className="min-w-full border rounded-lg" {...props}>{children}</table></div>,
      th: ({ children, ...props }) => <th className="px-4 py-3 bg-blue-50 text-left text-sm font-semibold border-b" {...props}>{children}</th>,
      td: ({ children, ...props }) => <td className="px-4 py-3 text-sm border-b" {...props}>{children}</td>,
      hr: () => <hr className="my-6 border-t-2" />
    };
    const isMarkdown = /[#*`[\]()\n\r]/.test(content);
    if (isMarkdown) {
      return <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>;
    }
    return content.split('\n').map((line, i) => line.trim() === '' ? <br key={i} /> : <p key={i}>{line}</p>);
  }, [content]);

  // Equalize heights only on desktop (lg and up) to avoid mobile gap
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const left = leftColRef.current;
    const right = rightColRef.current;
    if (!left || !right) return;

    const mql = window.matchMedia('(min-width: 1024px)'); // Tailwind lg breakpoint

    const syncHeights = () => {
      if (!left || !right) return;
      if (!mql.matches) {
        // Below desktop: let natural stacking height apply
        left.style.minHeight = '';
        return;
      }
      left.style.minHeight = '0px';
      const target = right.scrollHeight; // includes sticky children
      left.style.minHeight = target + 'px';
    };

    // Observe right column size changes (desktop only)
    const ro = new ResizeObserver(() => syncHeights());
    ro.observe(right);
    mql.addEventListener('change', syncHeights);
    window.addEventListener('resize', syncHeights);
    // Initial & next frame for safety
    syncHeights();
    requestAnimationFrame(syncHeights);

    return () => {
      ro.disconnect();
      mql.removeEventListener('change', syncHeights);
      window.removeEventListener('resize', syncHeights);
    };
  }, [loading, content, error]);

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900">
      <Helmet>
        <title>{actualFilename ? `${decodeURIComponent(actualFilename)} | Stock Analysis Demo` : slugParam ? decodeURIComponent(slugParam) : 'Stock Analysis Report'}</title>
        <meta name="description" content="AI-generated stock analysis demo report. Demo data only – not for investment decisions." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
        {fileMetadata?.date && <meta property="article:published_time" content={new Date(fileMetadata.date).toISOString()} />}
      </Helmet>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold mb-2 truncate">{slugParam ? decodeURIComponent(slugParam) : 'Stock Analysis Report'}</h1>
            {formattedDate && (
              <div className="text-blue-100 text-sm flex items-center">
                <FontAwesomeIcon icon={faClock} className="mr-2" />Generated: {formattedDate}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link to="/results" className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center font-medium"><FontAwesomeIcon icon={faArrowLeft} className="mr-2" />Back</Link>
            {actualFilename && (
              <>
                <a href={getDownloadUrl(actualFilename)} download className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center font-medium"><FontAwesomeIcon icon={faDownload} className="mr-2" />Download</a>
                <button onClick={handlePrint} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center font-medium"><FontAwesomeIcon icon={faPrint} className="mr-2" />Print</button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 py-8">
    <div className="flex flex-col gap-8 max-w-7xl mx-auto lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_24rem] lg:items-stretch">
          {/* Left column: Recommendation */}
  <div ref={leftColRef} className="min-w-0 order-1 h-full relative flex flex-col">
              <div className="bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400 p-4 rounded mb-6 text-sm">Demo data only. Do not rely on this analysis for real-world financial decisions.</div>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-md mb-6">
                  <h3 className="text-sm font-medium">Error Loading Report</h3>
                  <div className="mt-2 text-sm">{error}</div>
                </div>
              )}
              {loading ? (
                <div className="text-center py-16">
                  <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-600">Loading analysis report...</p>
                </div>
              ) : content ? (
                <div className="prose dark:prose-invert max-w-none recommendation-content flex-1 flex flex-col">{renderedContent}</div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <p className="text-gray-500">No content available</p>
                </div>
              )}
            </div>
          {/* Right column: Market data */}
          <div ref={rightColRef} className="order-2 h-full">
            <StocksProvider>
              <div className="sticky top-6 space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <h2 className="text-lg font-semibold mb-3">Market Snapshot</h2>
                  <SummaryStats variant="compact" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold mb-3">Filter Stocks</h3>
                  <StockFilters />
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold mb-3">Stocks</h3>
                  <div className="max-h-[480px] overflow-auto pr-1">
                    <StockTable />
                  </div>
                </div>
              </div>
            </StocksProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ViewRecommendation);