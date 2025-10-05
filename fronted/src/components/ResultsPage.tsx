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
  const [insightReferences, setInsightReferences] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [synopsis, setSynopsis] = useState('');
  const [hoveredReference, setHoveredReference] = useState<number | null>(null);

  useEffect(() => {
    generateInsight();
    generateSynopsis();
  }, [results]);

  // Handle reference hover events
  useEffect(() => {
    const handleReferenceMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.classList && target.classList.contains('insight-reference')) {
        const refId = parseInt(target.getAttribute('data-ref-id') || '0');
        if (refId > 0) {
          setHoveredReference(refId);
        }
      }
    };

    const handleReferenceMouseLeave = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.classList && target.classList.contains('insight-reference')) {
        setHoveredReference(null);
      }
    };

    // Only add listeners if we have references
    if (insightReferences.length > 0) {
      document.addEventListener('mouseenter', handleReferenceMouseEnter, true);
      document.addEventListener('mouseleave', handleReferenceMouseLeave, true);
    }

    return () => {
      document.removeEventListener('mouseenter', handleReferenceMouseEnter, true);
      document.removeEventListener('mouseleave', handleReferenceMouseLeave, true);
    };
  }, [insightReferences]);

  const generateInsight = async () => {
    if (results.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/search/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          papers: 5 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInsight(data.insight || 'Analysis of search results shows significant findings in space biology research.');
      setInsightReferences(Array.isArray(data.references) ? data.references : []);
    } catch (error) {
      console.error('Error generating insight:', error);
      setInsight('Analyzing the latest research in this field reveals important developments in space biology.');
      setInsightReferences([]);
    }
    setLoading(false);
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

  // Process insight text to add interactive references
  const processInsightWithReferences = (text: string) => {
    if (!insightReferences.length) return text;

    // Split text by references and create elements
    const parts = text.split(/(\[\d+\])/g);

    return parts.map((part, index) => {
      const refMatch = part.match(/\[(\d+)\]/);
      if (refMatch) {
        const refNumber = parseInt(refMatch[1]);
        const reference = insightReferences.find(ref => ref.id === refNumber);

        if (reference) {
          return (
            <span
              key={index}
              className="insight-reference"
              data-ref-id={refNumber}
              onMouseEnter={() => setHoveredReference(refNumber)}
              onMouseLeave={() => setHoveredReference(null)}
              onClick={() => {
                // Find the paper in results and scroll to it
                const paper = results.find(p => p && p.title === reference.title);
                if (paper) {
                  const paperIndex = results.indexOf(paper);
                  const paperElement = document.querySelector(`[data-paper-index="${paperIndex}"]`);
                  if (paperElement) {
                    paperElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Add temporary highlight
                    paperElement.classList.add('highlight-flash');
                    setTimeout(() => {
                      paperElement.classList.remove('highlight-flash');
                    }, 2000);
                  }
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              [{refNumber}]
            </span>
          );
        }
      }
      return part;
    });
  };

  return (
    <div className="results-page">
      <div className="stars-background"></div>
      <div className="twinkling"></div>

      <nav className="top-navbar">
        <div className="nav-content">
          <h1 className="nav-logo">BioSeek</h1>
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
                        {processInsightWithReferences(paragraph)}
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
                    data-paper-index={index}
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
