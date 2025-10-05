import React, { useState, useEffect } from 'react';
import GraphView from './GraphView';
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
      const response = await fetch(`${API_URL}/generate-insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          papers: results.slice(0, 5)
        })
      });

      const data = await response.json();
      setInsight(data.insight || 'Analysis of search results shows significant findings in space biology research.');
    } catch (error) {
      console.error('Error generating insight:', error);
      setInsight('Analyzing the latest research in this field reveals important developments in space biology.');
    }
    setLoading(false);
  };

  const generateSynopsis = () => {
    if (results.length === 0) {
      setSynopsis('');
      return;
    }

    const topPaper = results[0];
    const topics = topPaper.topics?.slice(0, 3).join(', ') || 'N/A';
    const organisms = topPaper.organisms?.slice(0, 3).join(', ') || 'N/A';
    
    const synopsisText = `
**Top Result:** ${topPaper.Title}

**Research Areas:** ${topics}

**Organisms Studied:** ${organisms}

**Relevance Score:** ${topPaper.relevance_score || 'N/A'}

This paper represents one of the most relevant findings for your search "${searchQuery}". 
The research focuses on ${topics.toLowerCase()}, providing valuable insights into space biology and its applications.
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
            {/* Graph Section */}
            <section className="graph-section">
              <h2 className="section-title">
                <span className="icon">🌐</span> Knowledge Graph
              </h2>
              <div className="graph-wrapper">
                <GraphView papers={results} onSelectPaper={onPaperClick} />
              </div>
              <p className="graph-description">
                Interactive visualization showing connections between papers. 
                Click on nodes to explore individual papers.
              </p>
            </section>

            {/* Synopsis Section */}
            {synopsis && (
              <section className="synopsis-section">
                <h2 className="section-title">
                  <span className="icon">📄</span> Top Result Synopsis
                </h2>
                <div className="synopsis-card">
                  <pre className="synopsis-text">{synopsis}</pre>
                  <button 
                    className="view-paper-btn"
                    onClick={() => onPaperClick(results[0])}
                  >
                    View Full Paper Details →
                  </button>
                </div>
              </section>
            )}

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
                  <p className="insight-text">{insight}</p>
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
                      <h3 className="paper-title">{paper.Title}</h3>
                      <div className="paper-score">
                        {paper.relevance_score ? `${paper.relevance_score}/10` : '—'}
                      </div>
                    </div>

                    <div className="paper-meta">
                      {paper.topics && paper.topics.length > 0 && (
                        <div className="meta-item">
                          <span className="meta-label">Topics:</span>
                          <div className="tags">
                            {paper.topics.slice(0, 3).map((topic: string, i: number) => (
                              <span key={i} className="tag tag-topic">{topic}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {paper.organisms && paper.organisms.length > 0 && (
                        <div className="meta-item">
                          <span className="meta-label">Organisms:</span>
                          <div className="tags">
                            {paper.organisms.slice(0, 3).map((org: string, i: number) => (
                              <span key={i} className="tag tag-organism">{org}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="paper-footer">
                      <span className="citations">📊 {paper.citations || 0} citations</span>
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
