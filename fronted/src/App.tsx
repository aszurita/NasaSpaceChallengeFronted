import React, { useState } from 'react';
import './App.css';
import HomePage from './components/HomePage';
import ResultsPage from './components/ResultsPage';
import PaperDetailPage from './components/PaperDetailPage';
import { API_URL } from './config';

type PageView = 'home' | 'results' | 'paper-detail';

function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setLoading(true);

    try {
      console.log('Searching for:', query);
      console.log('API URL:', API_URL);
      
      const response = await fetch(`${API_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          papers: 20 // Send top 20 papers for context
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Search results:', data);
      
      // Handle the new data format with items array
      setSearchResults(data.items || []);
      setCurrentPage('results');
    } catch (error) {
      console.error('Search error:', error);
      alert(`Error searching: ${error}. Please check if the backend is running on port 8000.`);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePaperClick = (paper: any) => {
    setSelectedPaper(paper);
    setCurrentPage('paper-detail');
  };

  const handleBackToResults = () => {
    setCurrentPage('results');
    setSelectedPaper(null);
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="App">
      {currentPage === 'home' && (
        <HomePage onSearch={handleSearch} />
      )}

      {currentPage === 'results' && (
        <ResultsPage
          searchQuery={searchQuery}
          results={searchResults}
          onPaperClick={handlePaperClick}
          onNewSearch={handleSearch}
        />
      )}

      {currentPage === 'paper-detail' && selectedPaper && (
        <PaperDetailPage
          paper={selectedPaper}
          onBack={handleBackToResults}
        />
      )}

      {loading && (
        <div className="global-loading">
          <div className="loading-spinner"></div>
          <p>Searching the cosmos...</p>
        </div>
      )}
    </div>
  );
}

export default App;
