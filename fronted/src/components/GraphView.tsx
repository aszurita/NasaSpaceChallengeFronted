import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { API_URL } from '../config';
import './GraphView.css';

interface GraphViewProps {
  papers: any[];
  onSelectPaper: (paper: any) => void;
  paperTitle?: string; // título del paper seleccionado para centrar el grafo
}

const GraphView: React.FC<GraphViewProps> = ({ papers, onSelectPaper, paperTitle }) => {
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
  const fgRef = useRef<any>(null);

  useEffect(() => {
    fetchGraphData();
  }, [papers, paperTitle]);

  const fetchGraphData = async () => {
    try {
      // Si hay un título de paper seleccionado, usamos el nuevo endpoint (POST) para recuperar su subgrafo
      if (paperTitle && paperTitle.trim().length > 0) {
        const graphQuery = `MATCH (p:Paper)-[r]-(n) WHERE p.title CONTAINS "${paperTitle}" RETURN p, r, n LIMIT 50`;
        const response = await fetch(`${API_URL}/graph`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: graphQuery, limit: 100 })
        });
        const neo4jData = await response.json();
        const converted = convertNeo4jToForceGraph(neo4jData);
        setGraphData(converted);
        return;
      }

      // Fallback: cargar el grafo completo (si el backend soporta GET /graph con formato nodes/links)
      const response = await fetch(`${API_URL}/graph`);
      const raw = await response.json();

      // Detectar formato y convertir si es necesario
      const isNeo4jFormat = !!raw.nodes?.[0]?.labels || !!raw.relationships;
      const data = isNeo4jFormat ? convertNeo4jToForceGraph(raw) : raw;

      // Si hay filtros por lista de papers (por id), aplicarlos sobre el formato final nodes/links
      if (papers.length > 0) {
        const paperIds = new Set(papers.map(p => p.id?.toString?.() ?? p.id));
        const filteredNodes = data.nodes.filter((n: any) => paperIds.has(n.id?.toString?.() ?? n.id));
        const nodeIdSet = new Set(filteredNodes.map((n: any) => n.id?.toString?.() ?? n.id));
        const filteredLinks = data.links.filter((l: any) => 
          nodeIdSet.has(l.source?.toString?.() ?? l.source) && nodeIdSet.has(l.target?.toString?.() ?? l.target)
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
        nodeVal={(node: any) => {
          const raw = Number(node.citations ?? node.size ?? 10);
          const val = isNaN(raw) ? 10 : raw;
          return Math.max(2, val / 10);
        }}
        linkWidth={(link: any) => {
          const raw = Number(link.weight ?? 1);
          const val = isNaN(raw) ? 1 : raw;
          return Math.max(0.5, val * 2);
        }}
        linkColor={() => 'rgba(255,255,255,0.2)'}
        onNodeClick={handleNodeClick}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.title;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          
          // Node circle
          ctx.fillStyle = node.color || '#4CAF50';
          ctx.beginPath();
          const raw = Number(node.citations ?? node.size ?? 10);
          const radius = Math.max(2, (isNaN(raw) ? 10 : raw) / 10);
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
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

// Convierte la respuesta Neo4j (nodes/relationships) a formato nodes/links para react-force-graph
function convertNeo4jToForceGraph(neo4jData: any) {
  const nodes = (neo4jData.nodes || []).map((n: any) => {
    const id = n.id?.toString?.() ?? n.id;
    const title = n.properties?.title || n.properties?.name || `Node ${id}`;
    const community = n.labels?.[0] || 'Unknown';
    const citations = n.properties?.citations ?? 10;
    return {
      id,
      title,
      community,
      citations,
      color: undefined
    };
  });

  const links = (neo4jData.relationships || []).map((r: any) => ({
    source: r.start_node?.toString?.() ?? r.start_node,
    target: r.end_node?.toString?.() ?? r.end_node,
    weight: r.properties?.weight ?? 1
  }));

  return { nodes, links };
}

export default GraphView;