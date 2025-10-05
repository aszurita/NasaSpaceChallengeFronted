import React, { useState } from 'react';
import './App.css';
import HomePage from './components/HomePage';
import ResultsPage from './components/ResultsPage';
import PaperDetailPage from './components/PaperDetailPage';
import { searchDocuments, DocumentHit } from './api/client';

type PageView = 'home' | 'results' | 'paper-detail';

function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocumentHit[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<DocumentHit | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    setErrorMessage(null);

    try {
      const results = await searchDocuments(query, { limit: 12, onlyFullContent: true });
      setSearchResults(results);
      setCurrentPage('results');
    } catch (error) {
      console.error('Search error:', error);
      setErrorMessage('No pudimos contactar la API de búsqueda. Intenta nuevamente.');
      setSearchResults([]);
    }

    setLoading(false);
  };

  const handlePaperClick = (paper: DocumentHit) => {
    setSelectedPaper(paper);
    setCurrentPage('paper-detail');
  };

  const handleBackToResults = () => {
    setCurrentPage('results');
    setSelectedPaper(null);
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
          errorMessage={errorMessage}
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
