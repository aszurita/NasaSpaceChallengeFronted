from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os

# Nuevo 
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json

app = FastAPI(title="BioSpace Knowledge API")

# CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar datos
with open('papers_classified.json', 'r') as f:
    PAPERS = json.load(f)

with open('graph_data.json', 'r') as f:
    GRAPH = json.load(f)

# Modelos
class SearchQuery(BaseModel):
    query: str
    topics: Optional[List[str]] = None
    organisms: Optional[List[str]] = None
    top_n: int = 10

@app.get("/")
def read_root():
    return {
        "message": "BioSpace Knowledge API",
        "total_papers": len(PAPERS),
        "endpoints": ["/papers", "/search", "/graph", "/stats"]
    }

@app.get("/papers")
def get_papers(skip: int = 0, limit: int = 50):
    """Obtener lista de papers con paginación"""
    return {
        "total": len(PAPERS),
        "papers": PAPERS[skip:skip + limit]
    }

@app.post("/search")
def search_papers(query: SearchQuery):
    """Búsqueda inteligente de papers"""
    query_lower = query.query.lower()
    
    # Filtrar papers
    results = []
    for paper in PAPERS:
        score = 0
        title_lower = paper['Title'].lower()
        
        # Score por título
        if query_lower in title_lower:
            score += 10
        
        # Score por palabras individuales
        query_words = query_lower.split()
        for word in query_words:
            if word in title_lower:
                score += 1
        
        # Filtro por topics
        if query.topics:
            if any(topic in paper['topics'] for topic in query.topics):
                score += 5
        
        # Filtro por organisms
        if query.organisms:
            if any(org in paper['organisms'] for org in query.organisms):
                score += 5
        
        if score > 0:
            paper_result = paper.copy()
            paper_result['relevance_score'] = score
            results.append(paper_result)
    
    # Ordenar por score
    results.sort(key=lambda x: x['relevance_score'], reverse=True)
    
    return {
        "query": query.query,
        "total_results": len(results),
        "results": results[:query.top_n]
    }

@app.get("/graph")
def get_graph(topic: Optional[str] = None):
    """Obtener datos del grafo"""
    if not topic:
        return GRAPH
    
    # Filtrar por topic
    filtered_nodes = [
        node for node in GRAPH['nodes']
        if topic in node.get('topics', [])
    ]
    
    node_ids = {node['id'] for node in filtered_nodes}
    
    filtered_links = [
        link for link in GRAPH['links']
        if link['source'] in node_ids and link['target'] in node_ids
    ]
    
    return {
        'nodes': filtered_nodes,
        'links': filtered_links
    }

@app.get("/stats")
def get_statistics():
    """Estadísticas generales"""
    all_topics = []
    all_organisms = []
    
    for paper in PAPERS:
        all_topics.extend(paper['topics'])
        all_organisms.extend(paper['organisms'])
    
    from collections import Counter
    
    return {
        "total_papers": len(PAPERS),
        "total_connections": len(GRAPH['links']),
        "topics_distribution": dict(Counter(all_topics)),
        "organisms_distribution": dict(Counter(all_organisms)),
        "years_range": [2000, 2025]  # Ajustar después
    }

@app.get("/paper/{paper_id}")
def get_paper_details(paper_id: int):
    """Detalles de un paper específico"""
    paper = next((p for p in PAPERS if p['id'] == paper_id), None)
    
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    # Encontrar papers relacionados
    related_links = [
        link for link in GRAPH['links']
        if link['source'] == paper_id or link['target'] == paper_id
    ]
    
    related_ids = set()
    for link in related_links:
        related_ids.add(link['source'] if link['source'] != paper_id else link['target'])
    
    related_papers = [p for p in PAPERS if p['id'] in related_ids][:5]
    
    return {
        **paper,
        "related_papers": related_papers
    }
class DiscoveryQuery(BaseModel):
    topic: str
    max_results: int = 10

class ChatMessage(BaseModel):
    message: str
    paper_ids: List[int]

@app.post("/discover")
def discover_sources(query: DiscoveryQuery):
    """
    Descubre papers relevantes para un tema específico
    Devuelve papers + contexto para el chat
    """
    topic_lower = query.topic.lower()
    
    # Buscar papers relevantes
    relevant_papers = []
    for paper in PAPERS:
        score = 0
        title_lower = paper['Title'].lower()
        
        # Scoring mejorado
        if topic_lower in title_lower:
            score += 50
        
        topic_words = topic_lower.split()
        for word in topic_words:
            if len(word) > 3 and word in title_lower:
                score += 10
        
        # Bonus por topics
        for topic in paper.get('topics', []):
            if any(word in topic.lower() for word in topic_words):
                score += 15
        
        if score > 0:
            paper_copy = paper.copy()
            paper_copy['discovery_score'] = score
            relevant_papers.append(paper_copy)
    
    # Ordenar y limitar
    relevant_papers.sort(key=lambda x: x['discovery_score'], reverse=True)
    top_papers = relevant_papers[:query.max_results]
    
    # Generar contexto para el chat
    context = {
        "topic": query.topic,
        "total_found": len(relevant_papers),
        "papers_selected": len(top_papers),
        "key_themes": list(set([
            topic for paper in top_papers 
            for topic in paper.get('topics', [])
        ]))[:5],
        "organisms_studied": list(set([
            org for paper in top_papers 
            for org in paper.get('organisms', [])
        ]))[:5]
    }
    
    return {
        "query": query.topic,
        "context": context,
        "papers": top_papers
    }

@app.post("/chat")
def chat_with_papers(chat: ChatMessage):
    """
    Chat sobre papers específicos (MVP con respuestas simuladas)
    En producción, esto se conectaría a un LLM real
    """
    
    # Obtener papers del contexto
    context_papers = [p for p in PAPERS if p['id'] in chat.paper_ids]
    
    if not context_papers:
        return {
            "response": "No tengo papers en contexto. Por favor, selecciona algunos papers primero.",
            "sources": []
        }
    
    message_lower = chat.message.lower()
    
    # Respuestas simuladas inteligentes basadas en keywords
    response = ""
    relevant_sources = []
    
    # Detectar tipo de pregunta
    if any(word in message_lower for word in ['resumen', 'resume', 'summary', 'qué estudian']):
        topics = set([t for p in context_papers for t in p.get('topics', [])])
        organisms = set([o for p in context_papers for o in p.get('organisms', [])])
        
        response = f"""Basado en los {len(context_papers)} papers seleccionados:

📊 **Áreas principales de investigación:**
{', '.join(list(topics)[:5])}

🔬 **Organismos estudiados:**
{', '.join(list(organisms)[:5])}

**Ejemplos de estudios:**
"""
        for i, paper in enumerate(context_papers[:3], 1):
            response += f"\n{i}. {paper['Title'][:80]}..."
            relevant_sources.append(paper['id'])
    
    elif any(word in message_lower for word in ['microgravity', 'microgravedad', 'espacio']):
        micro_papers = [p for p in context_papers if 'microgravity' in p['Title'].lower()]
        if micro_papers:
            response = f"""He encontrado {len(micro_papers)} estudios sobre microgravedad:

Los efectos de la microgravedad incluyen:
- Pérdida de masa ósea y muscular
- Cambios en expresión génica
- Alteraciones cardiovasculares
- Efectos en el sistema inmune

**Papers relevantes:**
"""
            for paper in micro_papers[:3]:
                response += f"\n• {paper['Title']}\n"
                relevant_sources.append(paper['id'])
        else:
            response = "En estos papers no encontré estudios específicos sobre microgravedad."
    
    elif any(word in message_lower for word in ['hueso', 'bone', 'pérdida ósea']):
        bone_papers = [p for p in context_papers if any(kw in p['Title'].lower() for kw in ['bone', 'skeletal', 'osteo'])]
        if bone_papers:
            response = f"""Encontré {len(bone_papers)} estudios sobre huesos:

**Hallazgos principales:**
- La microgravedad causa pérdida ósea significativa
- Mayor actividad osteoclástica
- Reducción en formación de hueso nuevo
- Efectos similares a osteoporosis acelerada

**Papers clave:**
"""
            for paper in bone_papers[:3]:
                response += f"\n• {paper['Title']}\n"
                relevant_sources.append(paper['id'])
        else:
            response = "No encontré estudios específicos sobre huesos en estos papers."
    
    elif any(word in message_lower for word in ['radiation', 'radiación']):
        rad_papers = [p for p in context_papers if 'radiation' in p['Title'].lower()]
        if rad_papers:
            response = f"""Estudios sobre radiación espacial ({len(rad_papers)} papers):

**Efectos documentados:**
- Daño al ADN
- Aumento de estrés oxidativo
- Riesgo cardiovascular
- Posibles efectos neurológicos

**Investigaciones relevantes:**
"""
            for paper in rad_papers[:3]:
                response += f"\n• {paper['Title']}\n"
                relevant_sources.append(paper['id'])
        else:
            response = "No hay estudios de radiación en esta selección."
    
    elif any(word in message_lower for word in ['plantas', 'plant', 'arabidopsis']):
        plant_papers = [p for p in context_papers if any(kw in p['Title'].lower() for kw in ['plant', 'arabidopsis', 'root'])]
        if plant_papers:
            response = f"""Investigación en plantas espaciales ({len(plant_papers)} papers):

**Temas de estudio:**
- Gravitropismo y crecimiento
- Expresión génica en microgravedad
- Desarrollo de raíces
- Fototropismo

**Papers sobre plantas:**
"""
            for paper in plant_papers[:3]:
                response += f"\n• {paper['Title']}\n"
                relevant_sources.append(paper['id'])
        else:
            response = "Esta selección no incluye estudios de plantas."
    
    else:
        # Respuesta general
        response = f"""Tengo información sobre {len(context_papers)} papers en contexto.

**Puedes preguntarme sobre:**
- Resumen de los estudios
- Efectos de microgravedad
- Pérdida ósea y muscular
- Radiación espacial
- Plantas en el espacio
- Organismos específicos (ratones, Arabidopsis, etc.)

¿Qué te gustaría saber?"""
        relevant_sources = [p['id'] for p in context_papers[:3]]
    
    return {
        "response": response,
        "sources": relevant_sources,
        "total_papers_in_context": len(context_papers)
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)