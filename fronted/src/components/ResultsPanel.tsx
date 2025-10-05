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
            key={paper.id} 
            className="result-card"
            onClick={() => onSelectPaper(paper)}
          >
            <div className="result-rank">#{idx + 1}</div>
            <div className="result-content">
              <h4>{paper.Title}</h4>
              <div className="result-meta">
                <span className="topic-badge">{paper.topics[0]}</span>
                <span className="organism-badge">{paper.organisms[0]}</span>
                <span className="score">
                  Score: {paper.relevance_score || 0}
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