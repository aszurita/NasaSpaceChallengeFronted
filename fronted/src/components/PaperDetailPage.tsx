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
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    // Mostrar insights fijos en español sobre microgravedad y células
    setInsights([
      "Microgravity fundamentally alters basic cellular processes including cell division, gene expression, and cell signaling. These changes occur due to the absence of gravitational forces that normally guide cell orientation and function.",
      "Cells exposed to microgravity experience increased oxidative stress and mitochondrial dysfunction, which can lead to DNA damage and premature cellular aging. This has direct implications for astronaut health during extended space missions.",
      "Cell culture systems in microgravity allow for more accurate modeling of human diseases than on Earth, offering new opportunities for drug development and regenerative therapies applicable on Earth."
    ]);

    // Datos de ejemplo del grafo de conocimiento
    const sampleGraphData = {
      "nodes": [
        { "id": "bion_m1", "label": "Bion-M 1 Mission", "type": "experiment", "properties": { "duration": "30 days", "dates": "April 19 - May 19, 2013", "country": "Russia" } },
        { "id": "male_mice", "label": "Male C57BL/6 Mice", "type": "subject", "properties": { "strain": "C57BL/6", "sex": "male", "initial_count": 300, "flight_survivors": 16 } },
        { "id": "microgravity", "label": "Microgravity", "type": "condition", "properties": { "description": "Space environment with minimal gravitational force" } },
        { "id": "spaceflight_group", "label": "Spaceflight Group (SF)", "type": "experimental_group", "properties": { "sample_size": 45, "survivors": 16, "survival_rate": "36%" } },
        { "id": "ground_control", "label": "Ground Control (GC)", "type": "experimental_group", "properties": { "sample_size": 45, "survivors": 38, "survival_rate": "84%" } },
        { "id": "vivarium_control", "label": "Vivarium Control (VC)", "type": "experimental_group", "properties": { "description": "Standard animal facility housing" } },
        { "id": "locomotor_impairment", "label": "Locomotor Impairment", "type": "outcome", "properties": { "incidence": "88% of SF mice", "observation": "Could not maintain steady posture" } },
        { "id": "body_weight", "label": "Body Weight", "type": "measurement", "properties": { "sf_change": "+8%", "gc_change": "+4%", "p_value": "0.0010" } },
        { "id": "open_field_test", "label": "Open Field Test", "type": "behavioral_test", "properties": { "measures": ["distance", "rearing", "thigmotaxis", "grooming"] } },
        { "id": "blood_pressure", "label": "Blood Pressure", "type": "physiological_measure" },
        { "id": "telemetry_probes", "label": "Telemetry Probes (PA-C10)", "type": "equipment", "properties": { "implanted": 35, "recovery_time": "5 days" } },
        { "id": "paste_food", "label": "Paste Food Diet", "type": "intervention", "properties": { "water_content": "76-78%", "consumption": "5.52±0.88 g/10g BW" } },
        { "id": "group_housing", "label": "Group Housing", "type": "procedure", "properties": { "mice_per_group": 3, "success_rate": "87%" } },
        { "id": "aggressive_behavior", "label": "Aggressive Behavior", "type": "risk_factor", "properties": { "prevalence": "male mice tendency", "mitigation": "environmental enrichment" } },
        { "id": "environmental_enrichment", "label": "Environmental Enrichment", "type": "intervention", "properties": { "items": ["shelters", "nesting material", "paper tubes"] } },
        { "id": "habitat_system", "label": "Automated Habitat System", "type": "equipment", "properties": { "capacity": 3, "autonomy": "30+ days" } },
        { "id": "video_surveillance", "label": "Video Surveillance", "type": "monitoring", "properties": { "segments": 2476, "duration_each": "30 min" } },
        { "id": "thigmotaxis", "label": "Thigmotaxis", "type": "behavior", "properties": { "description": "Wall-seeking behavior", "increased_in": "SF and GC groups" } },
        { "id": "motor_recovery", "label": "Motor Recovery", "type": "outcome", "properties": { "timeline": "6-8 hours post-landing" } },
        { "id": "injuries", "label": "Physical Injuries", "type": "outcome", "properties": { "limb_injuries": "25% of survivors", "tail_injuries": "38% of survivors" } },
        { "id": "sensorimotor_systems", "label": "Sensorimotor Systems", "type": "biological_system" },
        { "id": "handling_procedure", "label": "Daily Handling", "type": "training", "properties": { "frequency": "daily", "purpose": "habituation and monitoring" } },
        { "id": "iss", "label": "International Space Station", "type": "facility", "properties": { "comparison_mission": "91-day MDS experiment" } }
      ],
      "edges": [
        { "id": "e1", "source": "bion_m1", "target": "male_mice", "relation": "USES_SUBJECTS", "weight": 1.0 },
        { "id": "e2", "source": "bion_m1", "target": "microgravity", "relation": "EXPOSES_TO", "weight": 1.0 },
        { "id": "e3", "source": "bion_m1", "target": "spaceflight_group", "relation": "HAS_GROUP", "weight": 1.0 },
        { "id": "e4", "source": "bion_m1", "target": "ground_control", "relation": "HAS_GROUP", "weight": 1.0 },
        { "id": "e5", "source": "bion_m1", "target": "vivarium_control", "relation": "HAS_GROUP", "weight": 1.0 },
        { "id": "e6", "source": "male_mice", "target": "spaceflight_group", "relation": "BELONGS_TO", "weight": 0.8 },
        { "id": "e7", "source": "male_mice", "target": "aggressive_behavior", "relation": "EXHIBITS_RISK_OF", "weight": 0.7 },
        { "id": "e8", "source": "male_mice", "target": "group_housing", "relation": "HOUSED_IN", "weight": 1.0 },
        { "id": "e9", "source": "microgravity", "target": "locomotor_impairment", "relation": "CAUSES", "weight": 0.9 },
        { "id": "e10", "source": "microgravity", "target": "body_weight", "relation": "AFFECTS", "weight": 0.6 },
        { "id": "e11", "source": "microgravity", "target": "sensorimotor_systems", "relation": "DISRUPTS", "weight": 0.8 },
        { "id": "e12", "source": "spaceflight_group", "target": "habitat_system", "relation": "HOUSED_IN", "weight": 1.0 },
        { "id": "e13", "source": "spaceflight_group", "target": "paste_food", "relation": "RECEIVES", "weight": 1.0 },
        { "id": "e14", "source": "spaceflight_group", "target": "injuries", "relation": "DEVELOPS", "weight": 0.7 },
        { "id": "e15", "source": "spaceflight_group", "target": "open_field_test", "relation": "ASSESSED_BY", "weight": 1.0 },
        { "id": "e16", "source": "open_field_test", "target": "thigmotaxis", "relation": "MEASURES", "weight": 1.0 },
        { "id": "e17", "source": "open_field_test", "target": "locomotor_impairment", "relation": "DETECTS", "weight": 0.9 },
        { "id": "e18", "source": "telemetry_probes", "target": "blood_pressure", "relation": "MEASURES", "weight": 1.0 },
        { "id": "e19", "source": "telemetry_probes", "target": "male_mice", "relation": "IMPLANTED_IN", "weight": 1.0 },
        { "id": "e20", "source": "environmental_enrichment", "target": "aggressive_behavior", "relation": "REDUCES", "weight": 0.8 },
        { "id": "e21", "source": "environmental_enrichment", "target": "group_housing", "relation": "FACILITATES", "weight": 0.9 },
        { "id": "e22", "source": "handling_procedure", "target": "aggressive_behavior", "relation": "MITIGATES", "weight": 0.7 },
        { "id": "e23", "source": "habitat_system", "target": "video_surveillance", "relation": "INCLUDES", "weight": 1.0 },
        { "id": "e24", "source": "video_surveillance", "target": "injuries", "relation": "MONITORS", "weight": 0.8 },
        { "id": "e25", "source": "locomotor_impairment", "target": "motor_recovery", "relation": "FOLLOWED_BY", "weight": 1.0 },
        { "id": "e26", "source": "sensorimotor_systems", "target": "locomotor_impairment", "relation": "MANIFESTS_AS", "weight": 0.9 },
        { "id": "e27", "source": "ground_control", "target": "spaceflight_group", "relation": "COMPARED_WITH", "weight": 1.0 },
        { "id": "e28", "source": "thigmotaxis", "target": "habitat_system", "relation": "INDUCED_BY", "weight": 0.6 },
        { "id": "e29", "source": "paste_food", "target": "body_weight", "relation": "INFLUENCES", "weight": 0.5 },
        { "id": "e30", "source": "bion_m1", "target": "iss", "relation": "COMPARED_WITH", "weight": 0.4 }
      ],
      "metadata": {
        "graph_name": "Bion-M 1 Mission Knowledge Graph",
        "description": "Scientific knowledge graph of the 30-day biomedical space research mission",
        "primary_findings": [
          "Microgravity caused severe locomotor impairment (88% of SF mice)",
          "Survival rate was significantly lower in spaceflight (36%) vs ground control (84%)",
          "Environmental enrichment successfully reduced aggressive interactions",
          "Motor function recovery occurred within 6-8 hours post-landing"
        ]
      }
    };

    setGraphData(sampleGraphData);
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
              {graphData?.metadata && (
                <div className="graph-description">
                  <p><strong>{graphData.metadata.graph_name}</strong></p>
                  <p>{graphData.metadata.description}</p>
                </div>
              )}
              <div className="graph-container">
                {graphData ? (
                  <div className="graph-visualization">
                    <svg width="100%" height="800" viewBox="0 0 1400 800">
                      <defs>
                        {/* Arrow markers for different edge weights */}
                        <marker id="arrowhead-strong" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="#8b5cf6" />
                        </marker>
                        <marker id="arrowhead-medium" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="#a78bfa" />
                        </marker>
                        <marker id="arrowhead-weak" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="#c4b5fd" />
                        </marker>
                      </defs>

                      {/* Render edges with relation labels */}
                      {Array.isArray(graphData.edges) && graphData.edges.map((edge: any, i: number) => {
                        const sourceNode = graphData.nodes.find((n: any) => n.id === edge.source);
                        const targetNode = graphData.nodes.find((n: any) => n.id === edge.target);

                        if (!sourceNode || !targetNode) return null;

                        const sourceIndex = graphData.nodes.indexOf(sourceNode);
                        const targetIndex = graphData.nodes.indexOf(targetNode);
                        const nodeCount = graphData.nodes.length;

                        const angle1 = (sourceIndex / nodeCount) * 2 * Math.PI;
                        const angle2 = (targetIndex / nodeCount) * 2 * Math.PI;
                        const radius = 300;

                        const x1 = 700 + radius * Math.cos(angle1);
                        const y1 = 400 + radius * Math.sin(angle1);
                        const x2 = 700 + radius * Math.cos(angle2);
                        const y2 = 400 + radius * Math.sin(angle2);

                        // Calculate midpoint for label
                        const midX = (x1 + x2) / 2;
                        const midY = (y1 + y2) / 2;

                        // Determine edge color and marker based on weight
                        let strokeColor = "#c4b5fd";
                        let strokeWidth = 1;
                        let marker = "arrowhead-weak";

                        if (edge.weight >= 0.9) {
                          strokeColor = "#8b5cf6";
                          strokeWidth = 2.5;
                          marker = "arrowhead-strong";
                        } else if (edge.weight >= 0.7) {
                          strokeColor = "#a78bfa";
                          strokeWidth = 2;
                          marker = "arrowhead-medium";
                        }

                        return (
                          <g key={`edge-${i}`}>
                            <line
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke={strokeColor}
                              strokeWidth={strokeWidth}
                              opacity="0.6"
                              markerEnd={`url(#${marker})`}
                            />
                            <text
                              x={midX}
                              y={midY}
                              textAnchor="middle"
                              fontSize="9"
                              fill="#d1d5db"
                              style={{ pointerEvents: 'none' }}
                            >
                              <tspan x={midX} dy="-2">{edge.relation}</tspan>
                            </text>
                          </g>
                        );
                      })}

                      {/* Render nodes with colors by type */}
                      {graphData.nodes.map((node: any, i: number) => {
                        const nodeCount = graphData.nodes.length;
                        const angle = (i / nodeCount) * 2 * Math.PI;
                        const radius = 300;
                        const x = 700 + radius * Math.cos(angle);
                        const y = 400 + radius * Math.sin(angle);

                        // Color nodes by type
                        const nodeColors: any = {
                          experiment: "#ef4444",
                          subject: "#f59e0b",
                          condition: "#10b981",
                          experimental_group: "#3b82f6",
                          outcome: "#ec4899",
                          measurement: "#8b5cf6",
                          behavioral_test: "#6366f1",
                          physiological_measure: "#a78bfa",
                          equipment: "#64748b",
                          intervention: "#14b8a6",
                          procedure: "#06b6d4",
                          risk_factor: "#dc2626",
                          monitoring: "#475569",
                          behavior: "#f97316",
                          biological_system: "#84cc16",
                          training: "#22c55e",
                          facility: "#0ea5e9"
                        };

                        const nodeColor = nodeColors[node.type] || "#8b5cf6";

                        return (
                          <g
                            key={`node-${i}`}
                            className="graph-node-group"
                            onMouseEnter={() => setSelectedNode(node)}
                            onMouseLeave={() => setSelectedNode(null)}
                            style={{ cursor: 'pointer' }}
                          >
                            <circle
                              cx={x}
                              cy={y}
                              r="10"
                              fill={nodeColor}
                              stroke="#fff"
                              strokeWidth="2.5"
                              className="graph-node"
                            />
                            <text
                              x={x}
                              y={y - 18}
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight="600"
                              fill="#f3f4f6"
                              className="graph-label"
                            >
                              {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                            </text>
                            <text
                              x={x}
                              y={y + 25}
                              textAnchor="middle"
                              fontSize="9"
                              fill="#9ca3af"
                              fontStyle="italic"
                            >
                              {node.type}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Legend */}
                    <div className="graph-legend">
                      <h4>Node Types</h4>
                      <div className="legend-items">
                        <div className="legend-item"><div className="legend-color" style={{background: '#ef4444'}}></div> Experiment</div>
                        <div className="legend-item"><div className="legend-color" style={{background: '#f59e0b'}}></div> Subject</div>
                        <div className="legend-item"><div className="legend-color" style={{background: '#10b981'}}></div> Condition</div>
                        <div className="legend-item"><div className="legend-color" style={{background: '#3b82f6'}}></div> Experimental Group</div>
                        <div className="legend-item"><div className="legend-color" style={{background: '#ec4899'}}></div> Outcome</div>
                        <div className="legend-item"><div className="legend-color" style={{background: '#8b5cf6'}}></div> Measurement</div>
                        <div className="legend-item"><div className="legend-color" style={{background: '#14b8a6'}}></div> Intervention</div>
                        <div className="legend-item"><div className="legend-color" style={{background: '#64748b'}}></div> Equipment</div>
                      </div>
                    </div>

                    <div className="graph-stats">
                      <div className="stat">
                        <span className="stat-label">Entities</span>
                        <span className="stat-value">{graphData.nodes.length}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Relationships</span>
                        <span className="stat-value">{graphData.edges?.length || 0}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Edge Thickness</span>
                        <span className="stat-value">Indicates relationship strength</span>
                      </div>
                    </div>

                    {/* Node details panel */}
                    {selectedNode && (
                      <div className="node-details-panel">
                        <h4>{selectedNode.label}</h4>
                        <p className="node-type"><em>{selectedNode.type}</em></p>
                        {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                          <div className="node-properties">
                            {Object.entries(selectedNode.properties).map(([key, value]: [string, any]) => (
                              <div key={key} className="property-row">
                                <span className="property-key">{key.replace(/_/g, ' ')}:</span>
                                <span className="property-value">
                                  {Array.isArray(value) ? value.join(', ') : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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
