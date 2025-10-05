import json
import networkx as nx
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def build_knowledge_graph():
    print("🕸️ Construyendo grafo de conocimiento...")
    
    # Cargar papers
    with open('./papers_classified.json', 'r') as f:
        papers = json.load(f)
    
    # Crear grafo dirigido
    G = nx.Graph()
    
    # Agregar nodos (papers)
    for paper in papers:
        G.add_node(
            paper['id'],
            title=paper['Title'],
            topics=paper['topics'],
            organisms=paper['organisms'],
            citations=paper['citations'],
            link=paper['Link']
        )
    
    # Crear embeddings simples con TF-IDF
    titles = [p['Title'] for p in papers]
    vectorizer = TfidfVectorizer(max_features=100)
    tfidf_matrix = vectorizer.fit_transform(titles)
    
    # Calcular similaridad
    similarity_matrix = cosine_similarity(tfidf_matrix)
    
    # Agregar edges basados en similaridad
    threshold = 0.3  # Ajustable
    for i in range(len(papers)):
        for j in range(i + 1, len(papers)):
            if similarity_matrix[i][j] > threshold:
                G.add_edge(
                    papers[i]['id'],
                    papers[j]['id'],
                    weight=float(similarity_matrix[i][j])
                )
    
    # Calcular métricas del grafo
    print(f"📊 Nodos: {G.number_of_nodes()}")
    print(f"📊 Edges: {G.number_of_edges()}")
    
    # Detectar comunidades (clusters)
    from networkx.algorithms import community
    communities = community.greedy_modularity_communities(G)
    
    # Asignar comunidad a cada nodo
    node_to_community = {}
    for idx, comm in enumerate(communities):
        for node in comm:
            node_to_community[node] = idx
    
    nx.set_node_attributes(G, node_to_community, 'community')
    
    # Exportar para frontend
    graph_data = {
        'nodes': [
            {
                'id': node,
                **G.nodes[node],
                'community': node_to_community.get(node, 0)
            }
            for node in G.nodes()
        ],
        'links': [
            {
                'source': edge[0],
                'target': edge[1],
                'weight': G.edges[edge]['weight']
            }
            for edge in G.edges()
        ]
    }
    
    with open('graph_data.json', 'w') as f:
        json.dump(graph_data, f, indent=2)
    
    print("✅ Grafo construido y guardado")
    
    return graph_data

if __name__ == "__main__":
    build_knowledge_graph()