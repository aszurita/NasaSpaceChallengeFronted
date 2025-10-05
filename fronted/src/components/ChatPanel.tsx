import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../config';
import './ChatPanel.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: number[];
}

interface ChatPanelProps {
  contextPapers: any[];
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ contextPapers, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hola! Tengo ${contextPapers.length} papers cargados en mi contexto. Puedo ayudarte a entender:\n\n• Resumen de los estudios\n• Efectos de microgravedad\n• Pérdida ósea y muscular\n• Radiación espacial\n• Plantas en el espacio\n\n¿Qué te gustaría saber?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPapers, setShowPapers] = useState(false); // NUEVO
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    '¿Qué estudian estos papers?',
    '¿Qué efectos tiene la microgravedad?',
    '¿Qué dice sobre pérdida ósea?',
    'Háblame sobre radiación espacial'
  ];

  const handleSend = async (question?: string) => {
    const messageText = question || input;
    if (!messageText.trim()) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          paper_ids: contextPapers.map(p => p.id)
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        sources: data.sources
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error al procesar tu pregunta. Intenta de nuevo.'
      }]);
    }
    setLoading(false);
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div>
          <h3>💬 Chat con Papers</h3>
          <button 
            onClick={() => setShowPapers(!showPapers)}
            className="toggle-papers-btn"
          >
            📚 {showPapers ? 'Ocultar' : 'Ver'} papers en contexto ({contextPapers.length})
          </button>
        </div>
        <button onClick={onClose} className="close-chat-btn">✕</button>
      </div>

      {/* NUEVO: Panel de papers en contexto */}
      {showPapers && (
        <div className="context-papers-panel">
          <h4>Papers en contexto:</h4>
          <div className="context-papers-list">
            {contextPapers.map((paper, idx) => (
              <div key={paper.id} className="context-paper-item">
                <div className="paper-number">{idx + 1}</div>
                <div className="paper-info">
                  <p className="paper-title">{paper.Title}</p>
                  <div className="paper-tags">
                    {paper.topics.slice(0, 2).map((topic: string, i: number) => (
                      <span key={i} className="paper-tag">{topic}</span>
                    ))}
                  </div>
                  <a 
                    href={paper.Link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="paper-link"
                  >
                    🔗 Ver paper
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">{msg.content}</div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="message-sources">
                  📎 Basado en {msg.sources.length} papers
                  <button 
                    onClick={() => setShowPapers(true)}
                    className="show-sources-btn"
                  >
                    Ver cuáles
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-questions">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="quick-question-btn"
            disabled={loading}
          >
            {q}
          </button>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
          placeholder="Pregunta sobre los papers..."
          className="chat-input"
          disabled={loading}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="send-btn"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;