import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { API_URL } from '../config';
import './CytoscapeGraph.css';

interface CytoscapeGraphProps {
  paperId: number;
  paperTitle?: string;
}

const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({ paperId, paperTitle }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    setLoading(true);
    setError(null);

    // Fetch graph data from new graph API
    const graphQuery = paperTitle 
      ? `MATCH (p:Paper)-[r]-(n) WHERE p.title CONTAINS "${paperTitle}" RETURN p, r, n LIMIT 50`
      : null;

    fetch(`${API_URL}/graph`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: graphQuery,
        limit: 100
      })
    })
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

        // Convert Neo4j format to Cytoscape format
        const elements = convertNeo4jToCytoscape(data);

        // Initialize Cytoscape
        cyRef.current = cytoscape({
          container: containerRef.current,
          elements: elements,
          style: getGraphStyle(),
          layout: { name: 'cose', animate: true, fit: true },
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
  }, [paperId, paperTitle]);

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

// Convert Neo4j format to Cytoscape format
const convertNeo4jToCytoscape = (neo4jData: any) => {
  const elements: any[] = [];

  // Add nodes
  neo4jData.nodes?.forEach((node: any) => {
    const nodeData: any = {
      data: {
        id: node.id.toString(),
        label: node.properties.name || node.properties.title || `Node ${node.id}`,
        type: node.labels[0] || 'Unknown',
        ...node.properties
      }
    };

    // Add color based on node type
    const colors = {
      'Paper': '#667eea',
      'Topic': '#764ba2', 
      'Organism': '#f093fb',
      'Environment': '#4facfe',
      'Related Paper': '#4facfe'
    };
    
    nodeData.data.color = colors[nodeData.data.type as keyof typeof colors] || '#666';

    elements.push(nodeData);
  });

  // Add edges
  neo4jData.relationships?.forEach((rel: any) => {
    elements.push({
      data: {
        id: rel.id.toString(),
        source: rel.start_node.toString(),
        target: rel.end_node.toString(),
        label: rel.type,
        ...rel.properties
      }
    });
  });

  return elements;
};

// Get graph styling
const getGraphStyle = (): any[] => [
  {
    selector: 'node',
    style: {
      'background-color': 'data(color)',
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'color': '#fff',
      'font-size': '12px',
      'font-weight': 'bold',
      'text-outline-width': 2,
      'text-outline-color': '#000',
      'width': '60px',
      'height': '60px',
      'border-width': 2,
      'border-color': '#fff'
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 4,
      'border-color': '#fff',
      'background-color': 'data(color)'
    }
  },
  {
    selector: 'node.highlighted',
    style: {
      'border-width': 4,
      'border-color': '#ffd700',
      'background-color': 'data(color)'
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#ccc',
      'target-arrow-color': '#ccc',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'label': 'data(label)',
      'font-size': '10px',
      'color': '#fff',
      'text-outline-width': 1,
      'text-outline-color': '#000'
    }
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#ffd700',
      'target-arrow-color': '#ffd700',
      'width': 3
    }
  }
];

export default CytoscapeGraph;
