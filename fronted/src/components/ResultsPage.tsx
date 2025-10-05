
import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import '../styles/ResultsPage.css';

interface ResultsPageProps {
  searchQuery: string;
  results: any[];
  onPaperClick: (paper: any) => void;
  onNewSearch: (query: string) => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({
  searchQuery,
  results,
  onPaperClick,
  onNewSearch
}) => {
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [synopsis, setSynopsis] = useState('');

  useEffect(() => {
    generateInsight();
    generateSynopsis();
  }, [results]);

  const generateInsight = async () => {
    if (results.length === 0) return;

    setLoading(true);
    try {
      // Add timeout to avoid hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s

      const response = await fetch(`${API_URL}/generate-insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          papers: 5 
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      setInsight(data.insight || 'Analysis of search results shows significant findings in space biology research.');
    } catch (error) {
      console.error('Error generating insight:', error);
      setInsight('Analyzing the latest research in this field reveals important developments in space biology.');
    } finally {
      setLoading(false);
    }
  };

  const generateSynopsis = () => {
    if (results.length === 0) {
      setSynopsis('');
      return;
    }

    const topPaper = results[0];
    const certainty = (topPaper.certainty * 100).toFixed(1);
    
    const synopsisText = `
**Top Result:** ${topPaper.title}

**Abstract:** ${topPaper.abstract}

**Certainty Score:** ${certainty}%

**Source:** ${topPaper.link}

This paper represents one of the most relevant findings for your search "${searchQuery}". 
The research shows a ${certainty}% certainty match with your query, providing valuable insights into space biology and its applications.
    `.trim();

    setSynopsis(synopsisText);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNewSearch(searchInput);
    }
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
          <h2 className="search-title">Search Results for: <span className="query-highlight">"{searchQuery}"</span></h2>
          <p className="results-count">{results.length} papers found</p>
        </div>

        {results.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔭</div>
            <h3>No papers found</h3>
            <p>Try adjusting your search query or exploring different topics</p>
          </div>
        ) : (
          <>
           
            {/* Insight Section */}
            <section className="insight-section">
              <h2 className="section-title">
                <span className="icon">💡</span> Research Insight
              </h2>
              {loading ? (
                <div className="insight-loading">
                  <div className="loading-spinner"></div>
                  <p>Generating insights...</p>
                </div>
              ) : (
                <div className="insight-card">
                  <div className="insight-header">
                    <div className="insight-meta">
                      <span className="insight-source">🤖 AI Analysis</span>
                      <span className="insight-papers">📊 Based on {results.length} papers</span>
                    </div>
                  </div>
                  <div className="insight-content">
                    {insight.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="insight-paragraph">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Papers Grid */}
            <section className="papers-section">
              <h2 className="section-title">
                <span className="icon">📚</span> All Results ({results.length})
              </h2>
              <div className="papers-grid">
                {results.map((paper, index) => (
                  <div
                    key={index}
                    className="paper-card"
                    onClick={() => onPaperClick(paper)}
                  >
                    <div className="paper-header">
                      <h3 className="paper-title">{paper.title}</h3>
                      <div className="paper-score">
                        {(paper.certainty * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="paper-meta">
                      <div className="meta-item">
                        <span className="meta-label">Abstract:</span>
                        <p className="paper-abstract">{paper.abstract}</p>
                      </div>
                      {paper.content_preview && (
                        <div className="meta-item">
                          <span className="meta-label">Content Preview:</span>
                          <p className="paper-content-preview">{paper.content_preview}</p>
                        </div>
                      )}
                    </div>

                    <div className="paper-footer">
                      <span className="source-link">
                        <a href={paper.link} target="_blank" rel="noopener noreferrer">
                          📄 View Source
                        </a>
                      </span>
                      <span className="view-more">View Details →</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
