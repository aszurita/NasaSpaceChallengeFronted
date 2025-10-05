import React, { useMemo, useState } from 'react';
import '../styles/PaperDetailPage.css';
import { DocumentHit } from '../api/client';

interface PaperDetailPageProps {
  paper: DocumentHit;
  onBack: () => void;
}

const CHARACTER_LIMIT = 1800;

const PaperDetailPage: React.FC<PaperDetailPageProps> = ({ paper, onBack }) => {
  const [showFullContent, setShowFullContent] = useState(false);

  const keywordList = useMemo(
    () => (paper.keywords.length > 0 ? paper.keywords.slice(0, 8) : []),
    [paper]
  );

  const previewText = useMemo(() => {
    const basePreview = paper.content_preview || paper.snippet;
    if (!basePreview) {
      return 'Preview not available for this document.';
    }
    return basePreview.length > 280 ? `${basePreview.slice(0, 277)}…` : basePreview;
  }, [paper]);

  const abstractParagraphs = useMemo(
    () => (paper.full_abstract || paper.snippet).split(/\n+/).filter(Boolean),
    [paper]
  );

  const contentParagraphs = useMemo(() => {
    const paragraphs = (paper.full_content || paper.full_abstract || paper.snippet)
      .split(/\n+/)
      .map((section) => section.trim())
      .filter(Boolean);

    if (showFullContent) {
      return paragraphs;
    }

    const truncated: string[] = [];
    let total = 0;
    for (const paragraph of paragraphs) {
      if (total + paragraph.length > CHARACTER_LIMIT) {
        truncated.push(`${paragraph.slice(0, CHARACTER_LIMIT - total)}…`);
        break;
      }
      truncated.push(paragraph);
      total += paragraph.length;
    }

    return truncated;
  }, [paper, showFullContent]);

  const hasMoreContent = useMemo(() => {
    const contentLength = (paper.full_content || '').length;
    return contentLength > CHARACTER_LIMIT;
  }, [paper]);

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
        <h2 className="graph-title">Concepts in Orbit</h2>

        <div className="knowledge-graph">
          <div className="keyword-cloud">
            {keywordList.length === 0 ? (
              <p className="keyword-placeholder">No keywords detected for this document.</p>
            ) : (
              keywordList.map((keyword) => (
                <span key={keyword} className="keyword-chip">#{keyword}</span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="paper-content">
          <div className="summary-section">
            <h2 className="section-title">Paper Summary</h2>

            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-header">
                  <span className="card-icon">📄</span>
                  <h3>Title</h3>
                </div>
                <p>{paper.title}</p>
              </div>

              <div className="summary-card">
                <div className="card-header">
                  <span className="card-icon">🛰️</span>
                  <h3>Source</h3>
                </div>
                <p>{paper.sourceHost ?? 'External source not specified'}</p>
              </div>

              <div className="summary-card">
                <div className="card-header">
                  <span className="card-icon">🎯</span>
                  <h3>Confidence</h3>
                </div>
                <div className="impact-stats">
                  <div className="stat">
                    <span className="stat-label">Relevance</span>
                    <span className="stat-value">
                      {paper.certaintyScore !== null ? `${paper.certaintyScore}%` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {keywordList.length > 0 && (
                <div className="summary-card">
                  <div className="card-header">
                    <span className="card-icon">🏷️</span>
                    <h3>Key Concepts</h3>
                  </div>
                  <div className="tags-container">
                    {keywordList.map((keyword) => (
                      <span key={keyword} className="tag">{keyword}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {paper.link && (
              <a
                href={paper.link}
                target="_blank"
                rel="noopener noreferrer"
                className="view-original-button"
              >
                <span>📄</span> View Paper on Original Site
              </a>
            )}

            <div className="summary-card">
              <div className="card-header">
                <span className="card-icon">🧾</span>
                <h3>Abstract</h3>
              </div>
              {abstractParagraphs.map((paragraph, index) => (
                <p key={`abstract-${index}`}>{paragraph}</p>
              ))}
            </div>

            <div className="summary-card">
              <div className="card-header">
                <span className="card-icon">📚</span>
                <h3>Full Content</h3>
              </div>
              <div className="full-content">
                {contentParagraphs.map((paragraph, index) => (
                  <p key={`content-${index}`}>{paragraph}</p>
                ))}
              </div>
              {hasMoreContent && (
                <button
                  type="button"
                  className="view-original-button"
                  onClick={() => setShowFullContent((prev) => !prev)}
                >
                  {showFullContent ? 'Show less content' : 'Show complete content'}
                </button>
              )}
            </div>
          </div>

          <div className="chat-section">
            <div className="chat-container">
              <div className="chat-header">
                <h3>Document Facts</h3>
                <p>Useful metadata extracted from the API</p>
              </div>

              <div className="chat-messages">
                <div className="chat-message assistant">
                  <div className="message-content">
                    <p><strong>Primary link:</strong> {paper.link ? <a href={paper.link} target="_blank" rel="noopener noreferrer">{paper.link}</a> : 'Not available'}</p>
                    <p><strong>Preview:</strong> {previewText}</p>
                    <p><strong>Abstract length:</strong> {paper.full_abstract.length.toLocaleString()} characters</p>
                    <p><strong>Content length:</strong> {paper.full_content.length.toLocaleString()} characters</p>
                  </div>
                </div>

                <div className="chat-message assistant">
                  <div className="message-content">
                    <p><strong>Keywords:</strong></p>
                    <div className="tags-container">
                      {keywordList.length > 0 ? (
                        keywordList.map((keyword) => (
                          <span key={`detail-${keyword}`} className="tag">{keyword}</span>
                        ))
                      ) : (
                        <span className="tag">No keywords detected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperDetailPage;
