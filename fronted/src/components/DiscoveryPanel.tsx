import React, { useState } from 'react';
import { API_URL } from '../config';
import './DiscoveryPanel.css';

interface Paper {
  id: number;
  Title: string;
  topics: string[];
  organisms: string[];
  discovery_score: number;
}

interface DiscoveryPanelProps {
  onPapersSelected: (papers: Paper[]) => void;
}

const DiscoveryPanel: React.FC<DiscoveryPanelProps> = ({ onPapersSelected }) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [selectedPapers, setSelectedPapers] = useState<Set<number>>(new Set());

  const popularTopics = [
    'bone loss in space',
    'microgravity effects on plants',
    'radiation damage to DNA',
    'ISS microbiome',
    'muscle atrophy spaceflight',
    'cardiovascular changes',
  ];

  const handleDiscover = async (searchTopic?: string) => {
    const queryTopic = searchTopic || topic;
    if (!queryTopic.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: queryTopic,
          max_results: 10
        })
      });

      const data = await response.json();
      setResults(data);
      setSelectedPapers(new Set());
    } catch (error) {
      console.error('Discovery error:', error);
    }
    setLoading(false);
  };

  const togglePaper = (paperId: number) => {
    setSelectedPapers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paperId)) {
        newSet.delete(paperId);
      } else {
        newSet.add(paperId);
      }
      return newSet;
    });
  };

  const handleStartChat = () => {
    if (selectedPapers.size === 0) {
      alert('Selecciona al menos un paper para chatear');
      return;
    }

    const selected = results.papers.filter((p: Paper) => selectedPapers.has(p.id));
    onPapersSelected(selected);
  };

  return (
    <div className="discovery-panel">
      <div className="discovery-header">
        <h2>🔍 Descubrir Fuentes</h2>
        <p>Explora papers relevantes y chatea con ellos</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Ej: bone loss in microgravity"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleDiscover()}
          className="discovery-input"
        />
        <button 
          onClick={() => handleDiscover()} 
          disabled={loading}
          className="discover-btn"
        >
          {loading ? '🔄 Buscando...' : '🚀 Descubrir'}
        </button>
      </div>

      <div className="popular-topics">
        <h4>Temas populares:</h4>
        <div className="topic-chips">
          {popularTopics.map((t, idx) => (
            <button
              key={idx}
              onClick={() => handleDiscover(t)}
              className="topic-chip"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {results && (
        <div className="discovery-results">
          <div className="results-header">
            <h3>📚 {results.papers.length} Papers Encontrados</h3>
            <div className="context-info">
              <span>Temas: {results.context.key_themes.join(', ')}</span>
            </div>
          </div>

          <div className="papers-list">
            {results.papers.map((paper: Paper) => (
              <div 
                key={paper.id}
                className={`paper-item ${selectedPapers.has(paper.id) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedPapers.has(paper.id)}
                  onChange={() => togglePaper(paper.id)}
                  className="paper-checkbox"
                />
                <div className="paper-content">
                  <h4>{paper.Title}</h4>
                  <div className="paper-meta">
                    <span className="score">Score: {paper.discovery_score}</span>
                    {paper.topics.slice(0, 2).map((t, i) => (
                      <span key={i} className="topic-tag">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="action-bar">
            <div className="selection-info">
              {selectedPapers.size} papers seleccionados
            </div>
            <button
              onClick={handleStartChat}
              disabled={selectedPapers.size === 0}
              className="start-chat-btn"
            >
              💬 Iniciar Chat ({selectedPapers.size})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoveryPanel;