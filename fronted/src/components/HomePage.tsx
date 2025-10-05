import React, { useState } from 'react';
import '../styles/HomePage.css';

interface HomePageProps {
  onSearch: (query: string) => void | Promise<void>;
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
            <span className="gradient-text">Welcome to Spaceper</span>
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
          <div className="planet-container">
            <div className="planet">
              <div className="crater crater-1"></div>
              <div className="crater crater-2"></div>
              <div className="crater crater-3"></div>
              <div className="crater crater-4"></div>
            </div>
            <div className="orbit">
              <div className="satellite"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
