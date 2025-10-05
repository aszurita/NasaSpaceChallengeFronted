import React, { useState, useEffect, useRef } from 'react';
import '../styles/PaperDetailPage.css';

interface PaperDetailPageProps {
  paper: any;
  onBack: () => void;
}

const PaperDetailPage: React.FC<PaperDetailPageProps> = ({ paper, onBack }) => {
  // Fallback for missing paper
  const safePaper = paper || { Title: '', topics: [], organisms: [], citations: 0, Link: '', relevance_score: 0 };
  const [graphBuilding, setGraphBuilding] = useState(true);
  const [nodes, setNodes] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate graph building animation
    buildKnowledgeGraph();
  }, [safePaper]);

  const buildKnowledgeGraph = () => {
    setGraphBuilding(true);

    // Simulate nodes appearing one by one
    const allNodes = [
      { id: 'paper', label: safePaper.Title, type: 'main' },
      ...(safePaper.topics || []).slice(0, 4).map((topic: string, i: number) => ({
        id: `topic-${i}`,
        label: topic,
        type: 'topic'
      })),
      ...(safePaper.organisms || []).slice(0, 3).map((org: string, i: number) => ({
        id: `org-${i}`,
        label: org,
        type: 'organism'
      }))
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < allNodes.length) {
        setNodes(prev => [...prev, allNodes[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setGraphBuilding(false);
          // Auto scroll to content
          setTimeout(() => {
            contentRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 500);
        }, 1000);
      }
    }, 400);

    return () => clearInterval(interval);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          context_papers: [paper]
        })
      });

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
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
        <h1 className="nav-logo">Spaceper</h1>
      </nav>

      <div className="graph-section">
        <h2 className="graph-title">
          {graphBuilding ? 'Building Knowledge Graph...' : 'Knowledge Graph Complete'}
        </h2>

        <div className="knowledge-graph">
          <svg className="graph-svg" viewBox="0 0 800 400">
            {/* Draw connections */}
            {nodes.map((node, index) => {
              if (node.type !== 'main') {
                const angle = (index / (nodes.length - 1)) * Math.PI * 2;
                const x1 = 400;
                const y1 = 200;
                const x2 = 400 + Math.cos(angle) * 150;
                const y2 = 200 + Math.sin(angle) * 120;

                return (
                  <line
                    key={`line-${node.id}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className="graph-edge"
                  />
                );
              }
              return null;
            })}

            {/* Draw nodes */}
            {nodes.map((node, index) => {
              let x, y;
              if (node.type === 'main') {
                x = 400;
                y = 200;
              } else {
                const angle = (index / (nodes.length - 1)) * Math.PI * 2;
                x = 400 + Math.cos(angle) * 150;
                y = 200 + Math.sin(angle) * 120;
              }

              return (
                <g key={node.id} className={`graph-node node-${node.type}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={node.type === 'main' ? 40 : 25}
                    className={`node-circle node-${node.type}`}
                  />
                  <text
                    x={x}
                    y={y + (node.type === 'main' ? 60 : 45)}
                    className="node-label"
                    textAnchor="middle"
                  >
                    {node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="content-section" ref={contentRef}>
        <div className="paper-content">
            <div className="summary-section">
              <h2 className="section-title">Paper Summary</h2>

              <div className="summary-cards">
                <div className="summary-card">
                  <div className="card-header">
                    <span className="card-icon">📄</span>
                    <h3>Title</h3>
                  </div>
                  <p>{safePaper.Title}</p>
                </div>

                {safePaper.topics && safePaper.topics.length > 0 && (
                  <div className="summary-card">
                    <div className="card-header">
                      <span className="card-icon">🏷️</span>
                      <h3>Research Topics</h3>
                    </div>
                    <div className="tags-container">
                      {safePaper.topics.map((topic: string, i: number) => (
                        <span key={i} className="tag">{topic}</span>
                      ))}
                    </div>
                  </div>
                )}

                {safePaper.organisms && safePaper.organisms.length > 0 && (
                  <div className="summary-card">
                    <div className="card-header">
                      <span className="card-icon">🧬</span>
                      <h3>Organisms Studied</h3>
                    </div>
                    <div className="tags-container">
                      {safePaper.organisms.map((org: string, i: number) => (
                        <span key={i} className="tag tag-organism">{org}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="summary-card">
                  <div className="card-header">
                    <span className="card-icon">📊</span>
                    <h3>Impact</h3>
                  </div>
                  <div className="impact-stats">
                    <div className="stat">
                      <span className="stat-label">Citations</span>
                      <span className="stat-value">{safePaper.citations || 0}</span>
                    </div>
                    {safePaper.relevance_score && (
                      <div className="stat">
                        <span className="stat-label">Relevance</span>
                        <span className="stat-value">{safePaper.relevance_score}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <a
                href={safePaper.Link}
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
