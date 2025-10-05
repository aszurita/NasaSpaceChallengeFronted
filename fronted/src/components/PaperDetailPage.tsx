import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import '../styles/PaperDetailPage.css';

interface PaperDetailPageProps {
  paper: any;
  onBack: () => void;
}

const PaperDetailPage: React.FC<PaperDetailPageProps> = ({ paper, onBack }) => {
  // Fallback for missing paper
  const safePaper = paper || { 
    title: '', 
    abstract: '', 
    content_preview: '', 
    link: '', 
    certainty: 0, 
    full_abstract: '', 
    full_content: '' 
  };
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [graphData, setGraphData] = useState<any>(null);
  const [graphLoading, setGraphLoading] = useState(false);

  useEffect(() => {
    // Mostrar insights fijos en español sobre microgravedad y células
    setInsights([
      "Microgravity fundamentally alters basic cellular processes including cell division, gene expression, and cell signaling. These changes occur due to the absence of gravitational forces that normally guide cell orientation and function.",
      "Cells exposed to microgravity experience increased oxidative stress and mitochondrial dysfunction, which can lead to DNA damage and premature cellular aging. This has direct implications for astronaut health during extended space missions.",
      "Cell culture systems in microgravity allow for more accurate modeling of human diseases than on Earth, offering new opportunities for drug development and regenerative therapies applicable on Earth."
    ]);

    // Cargar el grafo del paper
    if (safePaper.link) {
      fetchPaperGraph();
    }
  }, [safePaper]);

  const fetchPaperGraph = async () => {
    setGraphLoading(true);
    try {
      const response = await fetch(`${API_URL}/paper_graph`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          link: safePaper.link
        })
      });
      const data = await response.json();
      setGraphData(data);
    } catch (error) {
      console.error('Error fetching paper graph:', error);
    }
    setGraphLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Construir el query con el título del paper y la pregunta del usuario
      const query = `I'm going to ask you a question and you need to answer based on the following publication named: ${safePaper.title} or more if necessary. This is my question: ${chatInput}`;

      const response = await fetch(`${API_URL}/ask_paper`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query
        })
      });

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      }]);
    }

    setChatLoading(false);
  };

  return (
    <div className="paper-detail-page">
      <div className="stars-background"></div>
      <div className="twinkling"></div>

      <nav className="detail-navbar">
        <button className="back-button" onClick={onBack}>
          ← Back to Results
        </button>
        <h1 className="nav-logo">BioSeek</h1>
      </nav>

      <div className="content-section" ref={contentRef}>
        <div className="paper-content">
            {/* Graph Visualization Section */}
            <div className="graph-section">
              <h2 className="section-title">Knowledge Graph</h2>
              <div className="graph-container">
                {graphLoading ? (
                  <div className="graph-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading knowledge graph...</p>
                  </div>
                ) : graphData ? (
                  <div className="graph-visualization">
                    <svg width="100%" height="600" viewBox="0 0 1200 600">
                      {/* Render edges first */}
                      {Array.isArray(graphData.edges) && graphData.edges.map((edge: any, i: number) => {
                        const sourceNode = Object.values(graphData.nodes._entity_dict).find(
                          (n: any) => n.id === edge.source
                        ) as any;
                        const targetNode = Object.values(graphData.nodes._entity_dict).find(
                          (n: any) => n.id === edge.target
                        ) as any;

                        if (!sourceNode || !targetNode) return null;

                        // Simple positioning based on index
                        const allNodes = Object.values(graphData.nodes._entity_dict);
                        const sourceIndex = allNodes.indexOf(sourceNode);
                        const targetIndex = allNodes.indexOf(targetNode);
                        const nodeCount = Math.min(allNodes.length, 50); // Limit for performance

                        const angle1 = (sourceIndex / nodeCount) * 2 * Math.PI;
                        const angle2 = (targetIndex / nodeCount) * 2 * Math.PI;
                        const radius = 250;

                        const x1 = 600 + radius * Math.cos(angle1);
                        const y1 = 300 + radius * Math.sin(angle1);
                        const x2 = 600 + radius * Math.cos(angle2);
                        const y2 = 300 + radius * Math.sin(angle2);

                        return (
                          <line
                            key={`edge-${i}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="rgba(139, 92, 246, 0.3)"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Render nodes */}
                      {Object.values(graphData.nodes._entity_dict).slice(0, 50).map((node: any, i: number) => {
                        const nodeCount = Math.min(Object.values(graphData.nodes._entity_dict).length, 50);
                        const angle = (i / nodeCount) * 2 * Math.PI;
                        const radius = 250;
                        const x = 600 + radius * Math.cos(angle);
                        const y = 300 + radius * Math.sin(angle);

                        return (
                          <g key={`node-${i}`}>
                            <circle
                              cx={x}
                              cy={y}
                              r="8"
                              fill="#8b5cf6"
                              stroke="#fff"
                              strokeWidth="2"
                              className="graph-node"
                            />
                            <text
                              x={x}
                              y={y - 15}
                              textAnchor="middle"
                              fontSize="10"
                              fill="#e0e0e0"
                              className="graph-label"
                            >
                              {node.id?.substring(0, 20)}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                    <div className="graph-stats">
                      <div className="stat">
                        <span className="stat-label">Nodes</span>
                        <span className="stat-value">{Object.keys(graphData.nodes._entity_dict).length}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Connections</span>
                        <span className="stat-value">{graphData.edges?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="graph-placeholder">
                    <p>📊 No graph data available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="summary-section">
              <h2 className="section-title">Key Insights</h2>
              <div className="summary-cards">
                {insights.map((ins, i) => (
                  <div key={i} className="summary-card insight-card">
                    <div className="card-header">
                      <span className="card-icon">{i === 0 ? '⭐' : i === 1 ? '✨' : '🔎'}</span>
                      <h3>Insight #{i + 1}</h3>
                    </div>
                    <div className="insight-content">
                      <p className="insight-text">{ins}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="section-title" style={{ marginTop: '2rem' }}>Paper Summary</h2>

              <div className="summary-cards">

                {safePaper.full_abstract ? (
                    <div className="summary-card">
                      <div className="card-header">
                        <span className="card-icon">📋</span>
                        <h3>Full Abstract</h3>
                      </div>
                      <p>{safePaper.full_abstract}</p>
                    </div>
                  ) : safePaper.abstract ? (
                    <div className="summary-card">
                      <div className="card-header">
                        <span className="card-icon">📝</span>
                        <h3>Abstract</h3>
                      </div>
                      <p>{safePaper.abstract}</p>
                    </div>
                  ) : null}

                <div className="summary-card">
                  <div className="card-header">
                    <span className="card-icon">📊</span>
                    <h3>Match Quality</h3>
                  </div>
                  <div className="impact-stats">
                    <div className="stat">
                      <span className="stat-label">Certainty</span>
                      <span className="stat-value">{(safePaper.certainty * 100).toFixed(1)}%</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Source</span>
                      <span className="stat-value">
                        <a href={safePaper.link} target="_blank" rel="noopener noreferrer">
                          View Paper
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href={safePaper.link}
                target="_blank"
                rel="noopener noreferrer"
                className="view-original-button"
              >
                <span>📄</span> View Paper on Original Site
              </a>
            </div>

          <div className="chat-section">
            <div className="chat-container">
              <div className="chat-header">
                <h3>💬 Ask Questions</h3>
                <p>Chat about this paper</p>
              </div>

              <div className="chat-messages">
                {chatMessages.length === 0 ? (
                  <div className="chat-empty">
                    <p>👋 Ask me anything about this paper!</p>
                    <div className="suggested-questions">
                      <button
                        className="suggestion"
                        onClick={() => setChatInput("What are the main findings?")}
                      >
                        What are the main findings?
                      </button>
                      <button
                        className="suggestion"
                        onClick={() => setChatInput("What methods were used?")}
                      >
                        What methods were used?
                      </button>
                      <button
                        className="suggestion"
                        onClick={() => setChatInput("What are the implications?")}
                      >
                        What are the implications?
                      </button>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.role}`}>
                      <div className="message-content">{msg.content}</div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="chat-message assistant">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>

              <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask a question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                />
                <button type="submit" className="chat-send" disabled={chatLoading}>
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperDetailPage;
