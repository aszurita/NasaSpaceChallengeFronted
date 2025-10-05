import React from 'react';
import './ResultsPanel.css';

interface ResultsPanelProps {
  results: any[];
  onSelectPaper: (paper: any) => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, onSelectPaper }) => {
  if (results.length === 0) {
    return (
      <div className="results-empty">
        <p>🔍 Search for papers to see results</p>
      </div>
    );
  }

  return (
    <div className="results-panel">
      <h3>📊 Found {results.length} papers</h3>
      <div className="results-list">
        {results.map((paper, idx) => (
          <div 
            key={idx} 
            className="result-card"
            onClick={() => onSelectPaper(paper)}
          >
            <div className="result-rank">#{idx + 1}</div>
            <div className="result-content">
              <h4>{paper.title}</h4>
              <p className="result-abstract">{paper.abstract}</p>
              <div className="result-meta">
                <span className="certainty-badge">
                  Certainty: {(paper.certainty * 100).toFixed(1)}%
                </span>
                <span className="score">
                  Link: <a href={paper.link} target="_blank" rel="noopener noreferrer">View Paper</a>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsPanel;