import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import './StatsPanel.css';

const StatsPanel: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (!stats) return <div>Loading stats...</div>;

  return (
    <div className="stats-panel">
      <h3>📊 Database Stats</h3>
      <div className="stat-item">
        <div className="stat-value">{stats.total_papers}</div>
        <div className="stat-label">Total Papers</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.total_connections}</div>
        <div className="stat-label">Connections</div>
      </div>
      
      <h4>Top Topics</h4>
      <div className="topic-list">
        {Object.entries(stats.topics_distribution)
          .sort(([,a]: any, [,b]: any) => b - a)
          .slice(0, 5)
          .map(([topic, count]: any) => (
            <div key={topic} className="topic-stat">
              <span>{topic}</span>
              <span className="count">{count}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default StatsPanel;
