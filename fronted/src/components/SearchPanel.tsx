import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import './SearchPanel.css';

interface SearchPanelProps {
  onSearch: (query: string, filters: any) => void;
}
const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedOrganisms, setSelectedOrganisms] = useState<string[]>([]);
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [availableFilters, setAvailableFilters] = useState<any>({ topics: {}, organisms: {}, missions: {} });

  useEffect(() => {
    // Cargar filtros disponibles del backend
    fetch(`${API_URL}/filters`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data === 'object') {
          setAvailableFilters({
            topics: data.topics || {},
            organisms: data.organisms || {},
            missions: data.missions || {}
          });
        }
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, {
      topics: selectedTopics,
      organisms: selectedOrganisms,
      missions: selectedMissions
    });
  };

  const toggleItem = (item: string, list: string[], setList: Function) => {
    setList((prev: string[]) =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  if (!availableFilters || !availableFilters.topics || !availableFilters.organisms || !availableFilters.missions) {
    return <div>Loading filters...</div>;
  }

  return (
    <div className="search-panel">
      <h2>🔍 Search NASA Papers</h2>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="e.g., 'bone loss microgravity'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">Search</button>
      </form>

      <div className="quick-searches">
        <h4>Quick Searches:</h4>
        <button onClick={() => setQuery('bone loss')}>Bone Loss</button>
        <button onClick={() => setQuery('radiation')}>Radiation</button>
        <button onClick={() => setQuery('Arabidopsis')}>Plants</button>
        <button onClick={() => setQuery('ISS microbiome')}>ISS Microbiome</button>
      </div>

      <div className="filters">
        <h4>Topics ({Object.keys(availableFilters.topics).length})</h4>
        <div className="filter-list">
          {Object.entries(availableFilters.topics)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 12)
            .map(([topic, count]: any) => (
              <label key={topic} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(topic)}
                  onChange={() => toggleItem(topic, selectedTopics, setSelectedTopics)}
                />
                <span>{topic.replace('_', ' ')} ({count})</span>
              </label>
            ))}
        </div>

        <h4>Organisms</h4>
        <div className="filter-list">
          {Object.entries(availableFilters.organisms)
            .sort(([, a]: any, [, b]: any) => b - a)
            .map(([org, count]: any) => (
              <label key={org} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedOrganisms.includes(org)}
                  onChange={() => toggleItem(org, selectedOrganisms, setSelectedOrganisms)}
                />
                <span>{org} ({count})</span>
              </label>
            ))}
        </div>

        <h4>Missions/Platforms</h4>
        <div className="filter-list">
          {Object.entries(availableFilters.missions)
            .sort(([, a]: any, [, b]: any) => b - a)
            .map(([mission, count]: any) => (
              <label key={mission} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedMissions.includes(mission)}
                  onChange={() => toggleItem(mission, selectedMissions, setSelectedMissions)}
                />
                <span>{mission} ({count})</span>
              </label>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;