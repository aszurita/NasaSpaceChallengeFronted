# 🌐 Integración de Cytoscape para Grafos de Conocimiento

## ✅ Backend Implementado

### Nuevo Endpoint

**`GET /paper/{paper_id}/cytoscape-graph`**

Genera un grafo de conocimiento en formato Cytoscape para un paper específico.

**Respuesta:**
```json
{
  "elements": {
    "nodes": [...],
    "edges": [...]
  },
  "style": [...],
  "layout": {...}
}
```

### Estructura del Grafo

**Nodos (nodes):**
- **Paper principal** (azul #667eea): El paper que se está visualizando
- **Topics** (morado #764ba2): Temas de investigación del paper
- **Organisms** (rosa #f093fb): Organismos estudiados
- **Related Papers** (celeste #4facfe): Papers relacionados

**Aristas (edges):**
- `STUDIES`: Paper → Topic
- `USES_MODEL`: Paper → Organism
- `RELATED_TO`: Paper → Related Paper

## 📦 Instalación de Cytoscape en el Frontend

### 1. Instalar dependencias

```bash
cd fronted
npm install cytoscape
npm install @types/cytoscape --save-dev
```

### 2. Crear componente CytoscapeGraph

Crear archivo: `fronted/src/components/CytoscapeGraph.tsx`

```typescript
import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { API_URL } from '../config';
import './CytoscapeGraph.css';

interface CytoscapeGraphProps {
  paperId: number;
}

const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({ paperId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Fetch graph data from backend
    fetch(`${API_URL}/paper/${paperId}/cytoscape-graph`)
      .then(res => res.json())
      .then(data => {
        // Initialize Cytoscape
        cyRef.current = cytoscape({
          container: containerRef.current,
          elements: data.elements,
          style: data.style,
          layout: data.layout
        });

        // Add click event to nodes
        cyRef.current.on('tap', 'node', (evt) => {
          const node = evt.target;
          console.log('Clicked node:', node.data());
        });
      })
      .catch(error => {
        console.error('Error loading graph:', error);
      });

    // Cleanup
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [paperId]);

  return (
    <div className="cytoscape-container">
      <div ref={containerRef} className="cytoscape-graph"></div>
    </div>
  );
};

export default CytoscapeGraph;
```

### 3. Crear estilos CSS

Crear archivo: `fronted/src/components/CytoscapeGraph.css`

```css
.cytoscape-container {
  width: 100%;
  height: 600px;
  background: rgba(10, 14, 39, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 15px;
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
}

.cytoscape-graph {
  width: 100%;
  height: 100%;
  border-radius: 10px;
}

.cytoscape-container::before {
  content: '🌐 Knowledge Graph';
  position: absolute;
  top: 10px;
  left: 20px;
  color: #667eea;
  font-size: 1.2rem;
  font-weight: 600;
  z-index: 10;
}
```

### 4. Integrar en PaperDetailPage

Modificar `fronted/src/components/PaperDetailPage.tsx`:

```typescript
import CytoscapeGraph from './CytoscapeGraph';

// ... dentro del componente, reemplazar la sección del grafo SVG:

<div className="graph-section">
  <h2 className="graph-title">Knowledge Graph</h2>
  <CytoscapeGraph paperId={paper.id} />
</div>
```

## 🎨 Personalización del Grafo

### Colores por Tipo de Nodo

- **Paper**: #667eea (Azul)
- **Topic**: #764ba2 (Morado)
- **Organism**: #f093fb (Rosa)
- **Related Paper**: #4facfe (Celeste)

### Layouts Disponibles

Puedes cambiar el layout en el backend modificando `layout.name`:

- `cose`: Layout basado en fuerzas (recomendado)
- `circle`: Nodos en círculo
- `grid`: Nodos en cuadrícula
- `breadthfirst`: Árbol jerárquico
- `concentric`: Círculos concéntricos

## 📊 Ejemplo de Uso

### 1. Iniciar el backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 2. Probar el endpoint

```bash
curl http://localhost:8000/paper/1/cytoscape-graph
```

### 3. Ver en el frontend

1. Navega a un paper específico
2. El grafo se cargará automáticamente
3. Puedes hacer click en los nodos para ver información
4. El grafo es interactivo: zoom, pan, drag

## 🔧 Funcionalidades Adicionales

### Agregar tooltips

```typescript
cyRef.current.on('mouseover', 'node', (evt) => {
  const node = evt.target;
  node.style('border-width', '3px');
  node.style('border-color', '#fff');
});

cyRef.current.on('mouseout', 'node', (evt) => {
  const node = evt.target;
  node.style('border-width', '0px');
});
```

### Exportar imagen del grafo

```typescript
const exportGraph = () => {
  if (cyRef.current) {
    const png = cyRef.current.png({
      full: true,
      scale: 2
    });
    // Descargar o mostrar la imagen
    const link = document.createElement('a');
    link.download = `graph-paper-${paperId}.png`;
    link.href = png;
    link.click();
  }
};
```

### Filtrar nodos por tipo

```typescript
const filterByType = (type: string) => {
  if (cyRef.current) {
    cyRef.current.nodes().hide();
    cyRef.current.nodes(`[type='${type}']`).show();
    cyRef.current.edges().hide();
  }
};
```

## 📝 Archivo JSON de Ejemplo

Ver: `backend/cytoscape_graph_example.json`

Este archivo contiene un ejemplo completo con:
- 8 nodos (1 paper, 2 topics, 1 organism, 1 gene, 2 procesos, 1 método)
- 8 relaciones con etiquetas descriptivas
- Estilos predefinidos
- Configuración de layout

## 🚀 Próximos Pasos

1. ✅ Backend implementado con endpoint `/paper/{id}/cytoscape-graph`
2. ⏳ Instalar `cytoscape` en el frontend
3. ⏳ Crear componente `CytoscapeGraph.tsx`
4. ⏳ Integrar en `PaperDetailPage.tsx`
5. ⏳ Personalizar estilos y comportamiento

## 🎯 Resultado Esperado

Al abrir un paper en `PaperDetailPage`, verás:
- Un grafo interactivo centrado en el paper
- Nodos de colores representando diferentes entidades
- Aristas con etiquetas mostrando relaciones
- Capacidad de zoom, pan y drag
- Click en nodos para más información

---

**Estado**: ✅ Backend listo | ⏳ Frontend pendiente de integración
