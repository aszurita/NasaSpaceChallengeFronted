Perfecto 🔥 te explico **qué hace todo ese código paso a paso** — este es un **servidor backend en Python** construido con **FastAPI**, diseñado para servir una **API llamada “BioSpace Knowledge API”**, que parece formar parte de tu proyecto del desafío de la NASA.

Vamos línea por línea y por bloques 👇

---

## 🧩 1. Importaciones y configuración básica

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
```

* **FastAPI** → framework para crear APIs web rápidas y modernas.
* **CORS Middleware** → permite que un frontend (por ejemplo React en `localhost:3000`) pueda hacer peticiones al backend.
* **Pydantic BaseModel** → sirve para definir los modelos de datos (por ejemplo, el formato que debe tener una búsqueda).
* **typing** → define tipos de listas, strings opcionales, etc.
* **json y os** → leer los archivos de datos que usa la API.

---

## 🚀 2. Crear la app principal y habilitar CORS

```python
app = FastAPI(title="BioSpace Knowledge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Esto:

* Crea la aplicación.
* Permite que un **frontend local** (por ejemplo, un dashboard en React) pueda comunicarse con esta API sin bloqueos de seguridad del navegador.

---

## 📚 3. Cargar los datos JSON

```python
with open('papers_classified.json', 'r') as f:
    PAPERS = json.load(f)

with open('graph_data.json', 'r') as f:
    GRAPH = json.load(f)
```

Aquí se cargan dos archivos:

* `papers_classified.json` → contiene los metadatos de los papers (id, título, topics, organismos, etc.)
* `graph_data.json` → contiene nodos y enlaces entre papers (un grafo de relaciones científicas).

---

## 🧱 4. Modelo de entrada para búsquedas

```python
class SearchQuery(BaseModel):
    query: str
    topics: Optional[List[str]] = None
    organisms: Optional[List[str]] = None
    top_n: int = 10
```

Esto define el formato del JSON que recibirá el endpoint `/search`.
Por ejemplo:

```json
{
  "query": "microgravity",
  "topics": ["cell biology"],
  "organisms": ["human"],
  "top_n": 5
}
```

---

## 🌍 5. Endpoint raíz `/`

```python
@app.get("/")
def read_root():
    return {
        "message": "BioSpace Knowledge API",
        "total_papers": len(PAPERS),
        "endpoints": ["/papers", "/search", "/graph", "/stats"]
    }
```

Cuando abres `http://localhost:8000/` te muestra:

* Un mensaje de bienvenida
* Cuántos papers hay
* Qué endpoints existen

---

## 📄 6. Endpoint `/papers`

```python
@app.get("/papers")
def get_papers(skip: int = 0, limit: int = 50):
    return {
        "total": len(PAPERS),
        "papers": PAPERS[skip:skip + limit]
    }
```

Sirve para **listar papers con paginación**, por ejemplo:

```
GET /papers?skip=0&limit=10
```

te devuelve los primeros 10.

---

## 🔍 7. Endpoint `/search` (búsqueda inteligente)

```python
@app.post("/search")
def search_papers(query: SearchQuery):
    ...
```

Aquí está el corazón del sistema 🔬

**Qué hace:**

1. Convierte la búsqueda en minúsculas (`query_lower`).
2. Recorre todos los papers.
3. Calcula un **“relevance_score”**:

   * +10 si el título contiene la búsqueda completa.
   * +1 por cada palabra de la búsqueda que aparezca en el título.
   * +5 si coincide con alguno de los topics filtrados.
   * +5 si coincide con alguno de los organismos.
4. Devuelve los resultados ordenados por ese score.
5. Solo entrega los `top_n` (por defecto, 10).

Ejemplo de respuesta:

```json
{
  "query": "microgravity",
  "total_results": 8,
  "results": [
    {"id": 23, "Title": "Cell growth in microgravity", "relevance_score": 16},
    ...
  ]
}
```

---

## 🧠 8. Endpoint `/graph`

```python
@app.get("/graph")
def get_graph(topic: Optional[str] = None):
    ...
```

Devuelve el **grafo completo** o filtrado por un tema específico (`topic`).

Si se pasa un topic:

* Filtra los nodos que tengan ese topic.
* Luego filtra los enlaces (links) entre esos nodos.

Ejemplo:

```
GET /graph?topic=Neuroscience
```

→ devuelve solo las conexiones entre papers del tema “Neuroscience”.

---

## 📊 9. Endpoint `/stats`

```python
@app.get("/stats")
def get_statistics():
    ...
```

Genera estadísticas globales:

* Número total de papers.
* Número de conexiones en el grafo.
* Distribución de topics y organismos (usando `Counter`).
* Rango de años (por ahora fijo 2000–2025).

Ejemplo de salida:

```json
{
  "total_papers": 608,
  "total_connections": 2500,
  "topics_distribution": {"Space Biology": 120, "Astrobiology": 80},
  "organisms_distribution": {"Human": 200, "Mouse": 150}
}
```

---

## 📘 10. Endpoint `/paper/{paper_id}`

```python
@app.get("/paper/{paper_id}")
def get_paper_details(paper_id: int):
    ...
```

Devuelve:

* Los **detalles de un paper específico**, según su ID.
* Los **papers relacionados**, buscando en `GRAPH['links']` aquellos conectados al mismo ID.

Por ejemplo:

```
GET /paper/23
```

→ devuelve el paper #23 y hasta 5 papers relacionados.

---

## 🏁 11. Ejecución local

```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

Esto inicia el servidor local cuando ejecutas:

```
python main.py
```

y lo hace accesible en:
👉 `http://localhost:8000`

---

## 🧠 En resumen

| Endpoint      | Método | Descripción                                 |
| ------------- | ------ | ------------------------------------------- |
| `/`           | GET    | Info general de la API                      |
| `/papers`     | GET    | Lista de papers con paginación              |
| `/search`     | POST   | Busca papers por texto, topics u organismos |
| `/graph`      | GET    | Devuelve el grafo completo o filtrado       |
| `/stats`      | GET    | Estadísticas generales                      |
| `/paper/{id}` | GET    | Detalle de un paper y sus relaciones        |

---

Si quieres, puedo mostrarte un **diagrama de flujo** de cómo pasa la información desde el frontend → API → JSON → resultado visual en el dashboard (ideal para tu presentación del NASA Challenge). ¿Quieres que te lo haga?
