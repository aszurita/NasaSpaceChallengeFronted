import React, { useState } from 'react';
import '../styles/HomePage.css';

interface HomePageProps {
  onSearch: (query: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const recommendations = [
    {
      title: "Microgravity Effects on Cell Biology",
      description: "Explore how space conditions affect cellular processes",
      query: "microgravity cell biology"
    },
    {
      title: "Plant Growth in Space",
      description: "Research on agriculture beyond Earth",
      query: "space agriculture plant growth"
    },
    {
      title: "Radiation Protection Mechanisms",
      description: "Biological adaptations to cosmic radiation",
      query: "radiation protection biology"
    },
    {
      title: "Bone Density in Astronauts",
      description: "Understanding musculoskeletal changes in space",
      query: "bone density microgravity astronauts"
    }
  ];

  return (
    <div className="home-page">
      <div className="stars-background"></div>
      <div className="twinkling"></div>

      <div className="home-content">
        <div className="welcome-section">
          <h1 className="main-title">
            <span className="gradient-text">Welcome to BioSeek</span>
          </h1>
          <p className="subtitle">Your Gateway to Space Biology Knowledge</p>
        </div>

        <form className="search-section" onSubmit={handleSubmit}>
          <div className="search-container">
            <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search space biology research..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>
        </form>

        <div className="recommendations-section">
          <h2 className="section-title">Recommended Topics</h2>
          <div className="recommendations-grid">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="recommendation-card"
                onClick={() => {
                  setSearchQuery(rec.query);
                  onSearch(rec.query);
                }}
              >
                <div className="card-icon">🔬</div>
                <h3>{rec.title}</h3>
                <p>{rec.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="animation-section">
          <div className="graph-network-container">
            <svg className="network-graph" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="nasa-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#667eea', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#764ba2', stopOpacity: 1}} />
                </linearGradient>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor: '#667eea', stopOpacity: 0.8}} />
                  <stop offset="50%" style={{stopColor: '#f093fb', stopOpacity: 0.8}} />
                  <stop offset="100%" style={{stopColor: '#667eea', stopOpacity: 0.8}} />
                </linearGradient>
              </defs>
              {/* Central Node - NASA Logo Style */}
              <circle className="central-node" cx="200" cy="200" r="30" />
              <text className="node-label central-label" x="200" y="208" textAnchor="middle">NASA</text>

              {/* Inner Circle Research Nodes */}
              <circle className="research-node node-1" cx="200" cy="80" r="18" />
              <text className="node-label" x="200" y="60" textAnchor="middle">Space Biology</text>

              <circle className="research-node node-2" cx="310" cy="130" r="18" />
              <text className="node-label" x="340" y="125" textAnchor="middle">Astrobiology</text>

              <circle className="research-node node-3" cx="340" cy="240" r="18" />
              <text className="node-label" x="375" y="245" textAnchor="middle">Microgravity</text>

              <circle className="research-node node-4" cx="260" cy="330" r="18" />
              <text className="node-label" x="260" y="360" textAnchor="middle">Radiation</text>

              <circle className="research-node node-5" cx="140" cy="330" r="18" />
              <text className="node-label" x="140" y="360" textAnchor="middle">Plant Science</text>

              <circle className="research-node node-6" cx="60" cy="240" r="18" />
              <text className="node-label" x="25" y="245" textAnchor="middle">Genomics</text>

              <circle className="research-node node-7" cx="90" cy="130" r="18" />
              <text className="node-label" x="60" y="125" textAnchor="middle">Cell Biology</text>

              <circle className="research-node node-8" cx="280" cy="200" r="18" />
              <text className="node-label" x="310" y="205" textAnchor="middle">Physiology</text>

              {/* Outer Circle Research Nodes */}
              <circle className="research-node node-9" cx="200" cy="30" r="14" />
              <text className="node-label" x="200" y="18" textAnchor="middle">Genetics</text>

              <circle className="research-node node-10" cx="340" cy="80" r="14" />
              <text className="node-label" x="365" y="75" textAnchor="middle">Immunology</text>

              <circle className="research-node node-11" cx="370" cy="200" r="14" />
              <text className="node-label" x="395" y="205" textAnchor="middle">Medicine</text>

              <circle className="research-node node-12" cx="320" cy="340" r="14" />
              <text className="node-label" x="345" y="345" textAnchor="middle">Ecology</text>

              <circle className="research-node node-13" cx="200" cy="370" r="14" />
              <text className="node-label" x="200" y="390" textAnchor="middle">Biochemistry</text>

              <circle className="research-node node-14" cx="80" cy="340" r="14" />
              <text className="node-label" x="55" y="345" textAnchor="middle">Neuroscience</text>

              <circle className="research-node node-15" cx="30" cy="200" r="14" />
              <text className="node-label" x="5" y="205" textAnchor="middle">Bioinformatics</text>

              <circle className="research-node node-16" cx="60" cy="80" r="14" />
              <text className="node-label" x="35" y="75" textAnchor="middle">Proteomics</text>

              {/* Central Connections to Inner Circle */}
              <line className="connection conn-1" x1="200" y1="200" x2="200" y2="80" />
              <line className="connection conn-2" x1="200" y1="200" x2="310" y2="130" />
              <line className="connection conn-3" x1="200" y1="200" x2="340" y2="240" />
              <line className="connection conn-4" x1="200" y1="200" x2="260" y2="330" />
              <line className="connection conn-5" x1="200" y1="200" x2="140" y2="330" />
              <line className="connection conn-6" x1="200" y1="200" x2="60" y2="240" />
              <line className="connection conn-7" x1="200" y1="200" x2="90" y2="130" />
              <line className="connection conn-8" x1="200" y1="200" x2="280" y2="200" />

              {/* Inner Circle Connections */}
              <line className="connection-secondary" x1="200" y1="80" x2="310" y2="130" />
              <line className="connection-secondary" x1="310" y1="130" x2="340" y2="240" />
              <line className="connection-secondary" x1="340" y1="240" x2="260" y2="330" />
              <line className="connection-secondary" x1="260" y1="330" x2="140" y2="330" />
              <line className="connection-secondary" x1="140" y1="330" x2="60" y2="240" />
              <line className="connection-secondary" x1="60" y1="240" x2="90" y2="130" />
              <line className="connection-secondary" x1="90" y1="130" x2="200" y2="80" />

              {/* Inner to Outer Connections */}
              <line className="connection-tertiary" x1="200" y1="80" x2="200" y2="30" />
              <line className="connection-tertiary" x1="310" y1="130" x2="340" y2="80" />
              <line className="connection-tertiary" x1="340" y1="240" x2="370" y2="200" />
              <line className="connection-tertiary" x1="260" y1="330" x2="320" y2="340" />
              <line className="connection-tertiary" x1="140" y1="330" x2="200" y2="370" />
              <line className="connection-tertiary" x1="60" y1="240" x2="30" y2="200" />
              <line className="connection-tertiary" x1="90" y1="130" x2="60" y2="80" />
              <line className="connection-tertiary" x1="280" y1="200" x2="370" y2="200" />

              {/* Cross Connections */}
              <line className="connection-quaternary" x1="200" y1="30" x2="340" y2="80" />
              <line className="connection-quaternary" x1="340" y1="80" x2="370" y2="200" />
              <line className="connection-quaternary" x1="370" y1="200" x2="320" y2="340" />
              <line className="connection-quaternary" x1="320" y1="340" x2="200" y2="370" />
              <line className="connection-quaternary" x1="200" y1="370" x2="80" y2="340" />
              <line className="connection-quaternary" x1="80" y1="340" x2="30" y2="200" />
              <line className="connection-quaternary" x1="30" y1="200" x2="60" y2="80" />
              <line className="connection-quaternary" x1="60" y1="80" x2="200" y2="30" />

              {/* Data Particles - More particles */}
              <circle className="data-particle particle-1" cx="200" cy="140" r="4" />
              <circle className="data-particle particle-2" cx="255" cy="165" r="4" />
              <circle className="data-particle particle-3" cx="270" cy="220" r="4" />
              <circle className="data-particle particle-4" cx="230" cy="265" r="4" />
              <circle className="data-particle particle-5" cx="170" cy="265" r="4" />
              <circle className="data-particle particle-6" cx="130" cy="220" r="4" />
              <circle className="data-particle particle-7" cx="145" cy="165" r="4" />
              <circle className="data-particle particle-8" cx="240" cy="200" r="4" />
              <circle className="data-particle particle-9" cx="200" cy="55" r="3" />
              <circle className="data-particle particle-10" cx="325" cy="105" r="3" />
              <circle className="data-particle particle-11" cx="355" cy="220" r="3" />
              <circle className="data-particle particle-12" cx="290" cy="335" r="3" />
            </svg>
            <div className="network-info">
              <p className="network-text">Exploring Interconnected Research</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
