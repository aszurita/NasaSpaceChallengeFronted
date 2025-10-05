# BioSeek - NASA Space Biology Knowledge Engine

## Overview

**BioSeek** is a modern web application built with React and TypeScript for the NASA Space Apps Challenge 2025 - "Build a Space Biology Knowledge Engine" challenge. The application provides intelligent search, knowledge graph visualization, and AI-powered analysis of 608+ NASA space biology research publications.

**Challenge URL:** https://www.spaceappschallenge.org/2025/challenges/build-a-space-biology-knowledge-engine/

---

## Project Structure

```
fronted/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── HomePage.tsx
│   │   ├── ResultsPage.tsx
│   │   ├── PaperDetailPage.tsx
│   │   └── CytoscapeGraph.tsx
│   ├── styles/
│   │   ├── HomePage.css
│   │   ├── ResultsPage.css
│   │   └── PaperDetailPage.css
│   ├── App.tsx
│   ├── config.ts
│   └── index.tsx
├── package.json
└── tsconfig.json
```

---

## Core Components

### 1. App.tsx - Application Root

**Location:** `src/App.tsx`

**Responsibility:** Global state management and navigation routing.

**State Management:**
```typescript
const [currentPage, setCurrentPage] = useState<PageView>('home');
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState<any[]>([]);
const [selectedPaper, setSelectedPaper] = useState<any>(null);
const [loading, setLoading] = useState(false);
```

**Key Functions:**
- `handleSearch(query: string)` - Executes API search requests (line 17)
- `handlePaperClick(paper: any)` - Navigates to paper detail view (line 55)
- `handleBackToResults()` - Returns to search results (line 60)
- `handleBackToHome()` - Returns to home page (line 65)

**Navigation Flow:**
```
HomePage → handleSearch() → ResultsPage → handlePaperClick() → PaperDetailPage
```

---

### 2. HomePage.tsx - Landing Page

**Location:** `src/components/HomePage.tsx`

**Features:**
- Animated star background
- Main search bar
- Recommended topic cards
- Animated SVG knowledge network (lines 92-212)

**Recommended Topics:**
1. Microgravity Effects on Cell Biology
2. Plant Growth in Space
3. Radiation Protection Mechanisms
4. Bone Density in Astronauts

**Visual Elements:**
- Animated node network with 16 interconnected scientific topics
- Data particles flowing through connections
- NASA gradient colors: #667eea and #764ba2

---

### 3. ResultsPage.tsx - Search Results Display

**Location:** `src/components/ResultsPage.tsx`

**Key Sections:**

#### Synopsis Section
- Displays most relevant paper (highest certainty score)
- Shows title, abstract, score, and source link
- Direct link to full paper details

#### AI Insights Section
- Generates AI analysis via `/search/insights` endpoint (line 61)
- Interactive references [1], [2] linked to papers (lines 123-168)
- Hover effects to highlight referenced papers

#### Papers Grid
- Card-based display with title, abstract, certainty score
- Click-to-navigate to detail view
- Highlight flash effect on reference clicks (line 152)

**React Hooks:**
```typescript
useEffect(() => {
  generateInsight();     // Generate AI insights
  generateSynopsis();    // Create top result synopsis
}, [results]);
```

---

### 4. PaperDetailPage.tsx - Paper Detail View

**Location:** `src/components/PaperDetailPage.tsx`

**Features:**

#### Knowledge Graph
- Renders `CytoscapeGraph` component with paper relationships
- Interactive visualization of scientific connections

#### Key Insights
- 3 AI-generated insights per paper
- Automatic fetching on component mount (lines 29-75)

#### Paper Summary
- Complete title, abstract, certainty score
- Source link to original publication
- Structured metadata cards

#### Interactive Chat
- Context-aware chat about the current paper (line 77)
- Endpoint: `POST /chat` with paper context
- Suggested questions:
  - "What are the main findings?"
  - "What methods were used?"
  - "What are the implications?"

**Chat Implementation:**
```typescript
const handleSendMessage = async (e: React.FormEvent) => {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    body: JSON.stringify({
      message: chatInput,
      context_papers: [paper]
    })
  });
};
```

---

### 5. CytoscapeGraph.tsx - Graph Visualization

**Location:** `src/components/CytoscapeGraph.tsx`

**Technology:** Cytoscape.js for interactive graph rendering

**Features:**
- Renders knowledge graph from Neo4j data
- Color coding by node type:
  - Paper: #667eea
  - Topic: #764ba2
  - Organism: #f093fb
  - Environment: #4facfe
- Interactive events:
  - Click: highlight node
  - Hover: white border effect
- Export graph as PNG
- Reset view functionality

**Data Conversion:**
```typescript
const convertNeo4jToCytoscape = (neo4jData: any) => {
  // Converts Neo4j format to Cytoscape format
  // Adds nodes with properties and colors
  // Adds edges with relationship data
};
```

**Layout Algorithm:** COSE (Compound Spring Embedder) with animation

---

## API Integration

**Configuration File:** `src/config.ts`

```typescript
export const API_URL = "https://nasa2025-backend-164841539788.europe-west1.run.app";
```

### API Endpoints Used:

| Endpoint | Method | Component | Line | Purpose |
|----------|--------|-----------|------|---------|
| `/search` | POST | App.tsx | 25 | Search papers |
| `/search/insights` | POST | ResultsPage.tsx | 66 | Generate AI insights |
| `/search/insights` | POST | PaperDetailPage.tsx | 38 | Paper-specific insights |
| `/chat` | POST | PaperDetailPage.tsx | 87 | Contextual chat |
| `/graph` | POST | CytoscapeGraph.tsx | 28 | Knowledge graph data |

---

## Design System

### Visual Theme
- **Background:** Animated starfield
- **Primary Colors:**
  - NASA gradient: #667eea to #764ba2
  - Accent: #f093fb
  - Text: #ffffff
  - Dark background: #0a0e27

### Animations
- Stars background with twinkling effect
- Data particles in graph visualization
- Highlight flash for temporary emphasis
- Loading spinners for async operations

### Responsive Design
- Adaptive layout for different screen sizes
- CSS Grid-based paper cards
- Flexible search components

---

## Dependencies

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "typescript": "^4.9.5",
  "axios": "^1.12.2",
  "cytoscape": "^3.33.1",
  "d3": "^7.9.0",
  "recharts": "^3.2.1"
}
```

### Key Libraries:
- **React 19:** Core framework
- **TypeScript:** Static type checking
- **Cytoscape:** Graph visualization
- **Axios:** HTTP client
- **D3:** Data manipulation
- **Recharts:** Statistics and charts

---

## Available Scripts

```bash
npm start              # Start development server on port 3000
npm run build          # Create production build
npm test              # Run Jest tests
npm run eject         # Eject from Create React App
```

---

## Data Flow

### 1. Search Flow
```
User enters query
    ↓
HomePage.handleSubmit()
    ↓
App.handleSearch()
    ↓
POST /search with query
    ↓
setSearchResults()
    ↓
Navigate to ResultsPage
    ↓
Render results + insights
```

### 2. Paper Detail Flow
```
Click on paper card
    ↓
ResultsPage.onPaperClick()
    ↓
App.handlePaperClick()
    ↓
setSelectedPaper()
    ↓
Navigate to PaperDetailPage
    ↓
Load:
  - Insights (POST /search/insights)
  - Graph (POST /graph)
  - Enable chat
```

### 3. Chat Interaction Flow
```
User types question
    ↓
handleSendMessage()
    ↓
POST /chat with context_papers
    ↓
AI response
    ↓
Update chatMessages state
```

---

## Key Features

### 1. Interactive References
References [1], [2] in insights are clickable and:
- Scroll to corresponding paper
- Apply highlight-flash effect
- Show tooltip on hover

**Implementation:** ResultsPage.tsx lines 123-168

### 2. Automatic Synopsis Generation
Automatically extracts:
- Top result by certainty score
- Formatted abstract
- Certainty percentage
- Source link

**Implementation:** ResultsPage.tsx lines 90-113

### 3. Dynamic Knowledge Graph
- Queries Neo4j via API
- Renders with Cytoscape.js
- Interactive: zoom, pan, click, hover
- Exportable as PNG image

**Implementation:** CytoscapeGraph.tsx lines 17-103

### 4. Contextual Chat
- Paper-specific context
- Suggested questions
- Typing indicator
- Message history

**Implementation:** PaperDetailPage.tsx lines 77-107

---

## Security and Best Practices

### TypeScript Usage
- Interface definitions for all props
- Explicit state typing
- Compile-time validation

### Error Handling
```typescript
try {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error();
  const data = await response.json();
} catch (error) {
  console.error('Error:', error);
  alert('Error message');
}
```

### Sanitization
- External links with `rel="noopener noreferrer"`
- Input validation before submission
- Fallbacks for missing data

---

## Performance Optimizations

### Current Optimizations:
- Component lazy loading capability
- Memoization with `useRef` for Cytoscape instances
- Cleanup in `useEffect` to prevent memory leaks
- Result pagination

### Bundle Size:
- React + ReactDOM: ~130KB (gzipped)
- Cytoscape: ~350KB
- Other dependencies: ~100KB
- **Total:** ~580KB

---

## Development and Debugging

### Debug Logs:
```typescript
console.log('Searching for:', query);              // App.tsx:22
console.log('API URL:', API_URL);                  // App.tsx:23
console.log('Response status:', response.status);  // App.tsx:34
console.log('Search results:', data);              // App.tsx:41
console.log('Clicked node:', node.data());         // CytoscapeGraph.tsx:65
```

### Recommended Tools:
- React DevTools
- Network tab for API inspection
- TypeScript compiler for type checking
- Browser console for runtime debugging

---

## NASA Space Apps Challenge Alignment

### Challenge Requirements Met:

**Functional Web Application:**
- Dynamic search interface
- Interactive knowledge graph visualization
- AI-powered insights generation

**Data Source:**
- 608+ NASA bioscience publications
- Structured metadata (topics, organisms, environments)
- Research relationships and connections

**Target Audiences:**
- Scientists: Hypothesis generation via knowledge graph
- Managers: Investment opportunities via insights
- Mission Architects: Research gaps and consensus areas

**Key Deliverables:**
- Interactive dashboard for publication exploration
- AI summarization of research findings
- Visual representation of research connections
- Actionable insights for space biology research

---

## Architecture Overview

### Frontend Stack:
- **Framework:** React 19 with TypeScript
- **State Management:** React Hooks (useState, useEffect, useRef)
- **Routing:** Internal state-based navigation
- **Styling:** CSS modules with animations

### Backend Integration:
- **API:** FastAPI (Python)
- **Database:** Neo4j (graph database)
- **Deployment:** Google Cloud Run
- **Protocol:** REST API with JSON

### Data Pipeline:
```
NASA Publications
    ↓
Backend Processing (Python)
    ↓
Neo4j Graph Database
    ↓
FastAPI REST Endpoints
    ↓
React Frontend
    ↓
User Interface
```

---

## Repository Information

**GitHub:** https://github.com/aszurita/NasaSpaceChallengeFronted

**Issues:** https://github.com/aszurita/NasaSpaceChallengeFronted/issues

**License:** ISC

---

## Version Information

**Version:** 1.0.0
**Last Updated:** October 2025
**Challenge:** NASA Space Apps Challenge 2025
**Category:** Build a Space Biology Knowledge Engine
