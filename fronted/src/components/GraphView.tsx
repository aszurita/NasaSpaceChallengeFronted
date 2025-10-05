import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { API_URL } from '../config';
import './GraphView.css';

interface GraphViewProps {
  papers: any[];
  onSelectPaper: (paper: any) => void;
}

const GraphView: React.FC<GraphViewProps> = ({ papers, onSelectPaper }) => {
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
  const fgRef = useRef<any>(null);

  useEffect(() => {
    fetchGraphData();
  }, [papers]);

  const fetchGraphData = async () => {
    try {
      const response = await fetch(`${API_URL}/graph`);
      const data = await response.json();
      
      // Si hay papers filtrados, mostrar solo esos
      if (papers.length > 0) {
        const paperIds = new Set(papers.map(p => p.id));
        const filteredNodes = data.nodes.filter((n: any) => paperIds.has(n.id));
        const filteredLinks = data.links.filter((l: any) => 
          paperIds.has(l.source) && paperIds.has(l.target)
        );
        setGraphData({ nodes: filteredNodes, links: filteredLinks });
      } else {
        setGraphData(data);
      }
    } catch (error) {
      console.error('Error loading graph:', error);
    }
  };

  const handleNodeClick = (node: any) => {
    onSelectPaper(node);
    
    // Highlight node
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(3, 1000);
    }
  };

  return (
    <div className="graph-container">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="title"
        nodeAutoColorBy="community"
        nodeVal={(node: any) => node.citations / 10}
        linkWidth={(link: any) => link.weight * 2}
        linkColor={() => 'rgba(255,255,255,0.2)'}
        onNodeClick={handleNodeClick}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.title;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          
          // Node circle
          ctx.fillStyle = node.color || '#4CAF50';
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.citations / 10, 0, 2 * Math.PI);
          ctx.fill();
          
          // Label (only if zoomed)
          if (globalScale > 2) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText(label.substring(0, 30), node.x, node.y + 10);
          }
        }}
        backgroundColor="#0a0e27"
        width={800}
        height={600}
      />
      
      <div className="graph-legend">
        <h4>Legend</h4>
        <p>🔵 Node size = Citations</p>
        <p>🎨 Color = Research cluster</p>
        <p>📏 Line thickness = Similarity</p>
      </div>
    </div>
  );
};

export default GraphView;