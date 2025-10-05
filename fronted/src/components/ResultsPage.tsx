import React, { useEffect, useState } from 'react';
import '../styles/ResultsPage.css';
import { DocumentHit, generateEditorialTitle } from '../api/client';

interface ResultsPageProps {
  searchQuery: string;
  results: DocumentHit[];
  onPaperClick: (paper: DocumentHit) => void;
  onNewSearch: (query: string) => void | Promise<void>;
  errorMessage?: string | null;
}

const ResultsPage: React.FC<ResultsPageProps> = ({
  searchQuery,
  results,
  onPaperClick,
  onNewSearch,
  errorMessage = null,
}) => {
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [insight, setInsight] = useState<string | null>(null);
  const [insightSource, setInsightSource] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;

    const fetchInsight = async () => {
      if (results.length === 0) {
        setInsight(null);
        setInsightSource(null);
        return;
      }

      setLoadingInsight(true);
      try {
        const baseText = results[0].full_content || results[0].full_abstract || results[0].snippet;
        const response = await generateEditorialTitle(baseText);

        if (!cancelled) {
          setInsight(response?.title ?? null);
          setInsightSource(response?.source ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('Insight generation failed', error);
          setInsight(null);
          setInsightSource(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingInsight(false);
        }
      }
    };

    fetchInsight();

    return () => {
      cancelled = true;
    };
  }, [results]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextQuery = searchInput.trim();
    if (nextQuery.length === 0) {
      return;
    }
    await onNewSearch(nextQuery);
  };

  return (
    <div className="results-page">
      <div className="stars-background"></div>
      <div className="twinkling"></div>

      <nav className="top-navbar">
        <div className="nav-content">
          <h1 className="nav-logo">Spaceper</h1>
          <form className="nav-search-form" onSubmit={handleSearchSubmit}>
            <div className="nav-search-container">
              <svg className="nav-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="nav-search-input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search..."
              />
            </div>
          </form>
        </div>
      </nav>

      <div className="results-content">
        <div className="search-info">
          <p className="search-message">Search made for <span className="query-highlight">"{searchQuery}"</span></p>
          {errorMessage && <p className="error-message">⚠️ {errorMessage}</p>}
        </div>

        <section className="insight-section">
          <h2 className="section-title">
            <span className="icon">💡</span> Research Insight
          </h2>
          {loadingInsight ? (
            <div className="insight-loading">
              <div className="loading-spinner"></div>
              <p>Generating insight from the top result...</p>
            </div>
          ) : (
            <div className="insight-card">
              {insight ? (
                <>
                  <p className="insight-text">{insight}</p>
                  {insightSource && (
                    <p className="insight-source">Generated via {insightSource}</p>
                  )}
                </>
              ) : (
                <p className="insight-placeholder">
                  We'll highlight the most relevant finding once results are available.
                </p>
              )}
            </div>
          )}
        </section>

        <section className="papers-section">
          <h2 className="section-title">
            <span className="icon">📚</span> Related Papers ({results.length})
          </h2>
          <div className="papers-grid">
            {results.map((paper) => (
              <div
                key={paper.id}
                className="paper-card"
                onClick={() => onPaperClick(paper)}
              >
                <div className="paper-header">
                  <h3 className="paper-title">{paper.title}</h3>
                  <div className="paper-score">
                    {paper.certaintyScore !== null ? `${paper.certaintyScore}%` : '—'}
                  </div>
                </div>

                <p className="paper-snippet">{paper.snippet}</p>

                <div className="paper-meta">
                  {paper.keywords.length > 0 && (
                    <div className="meta-item">
                      <span className="meta-label">Key concepts:</span>
                      <div className="tags">
                        {paper.keywords.slice(0, 3).map((keyword) => (
                          <span key={keyword} className="tag tag-topic">{keyword}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="paper-footer">
                  {paper.sourceHost && (
                    <span className="citations">� {paper.sourceHost}</span>
                  )}
                  <span className="view-more">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResultsPage;
