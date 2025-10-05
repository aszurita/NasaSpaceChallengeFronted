import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import CytoscapeGraph from './CytoscapeGraph';
import '../styles/PaperDetailPage.css';

interface PaperDetailPageProps {
  paper: any;
  onBack: () => void;
}

const PaperDetailPage: React.FC<PaperDetailPageProps> = ({ paper, onBack }) => {
  // Fallback for missing paper
  const safePaper = paper || { Title: '', topics: [], organisms: [], citations: 0, Link: '', relevance_score: 0 };
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
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
        <CytoscapeGraph paperId={safePaper.id || 0} />
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
