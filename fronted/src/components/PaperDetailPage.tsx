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
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!safePaper || !safePaper.title) {
        setInsights([]);
        return;
      }
      setInsightsLoading(true);
      try {
        // Use the insights endpoint for better analysis
        const response = await fetch(`${API_URL}/search/insights`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: safePaper.title,
            papers: 5
          })
        });
        const data = await response.json();
        const text: string = data.insight || '';
        
        // Split the insight into meaningful paragraphs
        const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
        
        if (paragraphs.length > 0) {
          // Take the first 3 paragraphs as insights
          setInsights(paragraphs.slice(0, 3));
        } else {
          // Fallback insights based on metadata
          const fallback: string[] = [];
          fallback.push(`Certainty Score: ${(safePaper.certainty * 100).toFixed(1)}%`);
          fallback.push(`Abstract: ${safePaper.abstract?.substring(0, 100)}...`);
          fallback.push(`Source: ${safePaper.link}`);
          setInsights(fallback.slice(0,3));
        }
      } catch (e) {
        console.error('Error fetching paper insights:', e);
        const fallback: string[] = [];
        fallback.push(`Certainty Score: ${(safePaper.certainty * 100).toFixed(1)}%`);
        fallback.push(`Abstract: ${safePaper.abstract?.substring(0, 100)}...`);
        fallback.push(`Source: ${safePaper.link}`);
        setInsights(fallback.slice(0,3));
      } finally {
        setInsightsLoading(false);
      }
    };
    fetchInsights();
  }, [safePaper]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Construir el query con el título del paper y la pregunta del usuario
      const query = `I'm going to ask you a question and you need to answer based on the following publication named: ${safePaper.title} or more if necessary. This is my question  ${chatInput}`;

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

      <div className="graph-section">
        <CytoscapeGraph 
          paperId={safePaper.title ? safePaper.title.length : 0} 
          paperTitle={safePaper.title}
        />
      </div>

      <div className="content-section" ref={contentRef}>
        <div className="paper-content">
            <div className="summary-section">
              <h2 className="section-title">Key Insights</h2>
              {insightsLoading ? (
                <div className="summary-cards">
                  <div className="summary-card"><p>Generating insights...</p></div>
                </div>
              ) : (
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
              )}

              <h2 className="section-title" style={{ marginTop: '2rem' }}>Paper Summary</h2>

              <div className="summary-cards">
                <div className="summary-card">
                  <div className="card-header">
                    <span className="card-icon">📄</span>
                    <h3>Title</h3>
                  </div>
                  <p>{safePaper.title}</p>
                </div>

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
