import React, { useState } from 'react';
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
