import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { API_URL } from '../config';
import './CytoscapeGraph.css';

interface CytoscapeGraphProps {
  paperId: number;
}

const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({ paperId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    setLoading(true);
    setError(null);

    // Fetch graph data from backend
    fetch(`${API_URL}/paper/${paperId}/cytoscape-graph`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        // Destroy previous instance if exists
        if (cyRef.current) {
          cyRef.current.destroy();
        }

        // Initialize Cytoscape
        cyRef.current = cytoscape({
          container: containerRef.current,
          elements: data.elements,
          style: data.style,
          layout: data.layout,
          wheelSensitivity: 0.2,
          minZoom: 0.5,
          maxZoom: 3
        });

        // Add click event to nodes
        cyRef.current.on('tap', 'node', (evt) => {
          const node = evt.target;
          console.log('Clicked node:', node.data());
          
          // Highlight selected node
          cyRef.current?.nodes().removeClass('highlighted');
          node.addClass('highlighted');
        });

        // Add hover effects
        cyRef.current.on('mouseover', 'node', (evt) => {
          const node = evt.target;
          node.style({
            'border-width': '4px',
            'border-color': '#fff'
          });
        });

        cyRef.current.on('mouseout', 'node', (evt) => {
          const node = evt.target;
          node.style({
            'border-width': '0px'
          });
        });

        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading graph:', error);
        setError('Failed to load knowledge graph. Please try again.');
        setLoading(false);
      });

    // Cleanup
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [paperId]);

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.fit();
      cyRef.current.center();
    }
  };

  const handleExport = () => {
    if (cyRef.current) {
      const png = cyRef.current.png({
        full: true,
        scale: 2,
        bg: '#0a0e27'
      });
      
      const link = document.createElement('a');
      link.download = `knowledge-graph-paper-${paperId}.png`;
      link.href = png;
      link.click();
    }
  };

  return (
    <div className="cytoscape-wrapper">
      <div className="cytoscape-header">
        <h3 className="cytoscape-title">🌐 Knowledge Graph</h3>
        <div className="cytoscape-controls">
          <button onClick={handleReset} className="control-btn" title="Reset view">
            🔄 Reset
          </button>
          <button onClick={handleExport} className="control-btn" title="Export as PNG">
            📥 Export
          </button>
        </div>
      </div>

      {loading && (
        <div className="cytoscape-loading">
          <div className="loading-spinner"></div>
          <p>Loading knowledge graph...</p>
        </div>
      )}

      {error && (
        <div className="cytoscape-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      <div className="cytoscape-container">
        <div ref={containerRef} className="cytoscape-graph"></div>
      </div>

      <div className="cytoscape-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#667eea' }}></span>
            <span>Paper</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#764ba2' }}></span>
            <span>Topic</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#f093fb' }}></span>
            <span>Organism</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#4facfe' }}></span>
            <span>Related Paper</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CytoscapeGraph;
