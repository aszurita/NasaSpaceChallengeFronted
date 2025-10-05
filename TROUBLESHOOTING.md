# 🔧 Troubleshooting - "Searching the cosmos..." se queda cargando

## 🐛 Problema

Al buscar en el navbar, aparece "Searching the cosmos..." pero no muestra resultados.

## ✅ Verificaciones

### 1. Backend está corriendo

```cmd
curl http://localhost:8000
```

**Debe devolver:**
```json
{
  "message": "BioSpace Knowledge API",
  "total_papers": 607,
  "endpoints": [...]
}
```

✅ **CONFIRMADO**: El backend está corriendo correctamente.

### 2. Endpoint de búsqueda funciona

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/search" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"query":"microgravity","top_n":5}'
```

✅ **CONFIRMADO**: Devuelve 57 resultados para "microgravity".

### 3. CORS está configurado

En `backend/main.py` líneas 17-20:
```python
allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"]
```

✅ **CONFIRMADO**: CORS permite ambos orígenes.

## 🔍 Diagnóstico del Problema

El problema está en el **frontend**. Posibles causas:

### Causa 1: Frontend no está compilado con los últimos cambios

**Solución:**
1. Detén el servidor frontend (Ctrl+C)
2. Limpia cache:
   ```cmd
   cd fronted
   rm -rf node_modules/.cache
   ```
3. Reinicia:
   ```cmd
   npm start
   ```

### Causa 2: Error de CORS en el navegador

**Cómo verificar:**
1. Abre el navegador en `http://localhost:3000`
2. Presiona F12 para abrir DevTools
3. Ve a la pestaña **Console**
4. Busca errores de CORS como:
   ```
   Access to fetch at 'http://localhost:8000/search' from origin 'http://localhost:3000' 
   has been blocked by CORS policy
   ```

**Solución si hay error CORS:**
- Reinicia el backend
- Verifica que `backend/main.py` tenga el CORS correcto

### Causa 3: Puerto incorrecto

**Verificar:**
1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Busca en el navbar
4. Mira la petición a `/search`
5. Verifica que vaya a `http://localhost:8000/search`

**Si va a otro puerto:**
- Verifica `fronted/src/config.ts`
- Debe tener: `http://localhost:8000`

### Causa 4: Error de JavaScript

**Cómo verificar:**
1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Busca errores en rojo

**Errores comunes:**
- `Cannot find module 'cytoscape'` → Instala: `npm install cytoscape`
- `Unexpected token` → Error de sintaxis en el código
- `Network request failed` → Backend no está corriendo

## 📋 Pasos de Diagnóstico

### Paso 1: Abrir DevTools

1. Abre `http://localhost:3000`
2. Presiona **F12**
3. Ve a la pestaña **Console**

### Paso 2: Buscar

1. Escribe "microgravity" en el navbar
2. Presiona Enter
3. **Observa la consola**

### Paso 3: Ver qué dice la consola

Deberías ver logs como:
```
Searching for: microgravity
API URL: http://localhost:8000
Response status: 200
Search results: {query: "microgravity", total_results: 57, results: Array(20)}
```

### Paso 4: Ver Network

1. Ve a la pestaña **Network** en DevTools
2. Busca de nuevo
3. Busca la petición `search`
4. Verifica:
   - **Status**: Debe ser 200
   - **Response**: Debe tener `results` array
   - **Headers**: Debe tener `Content-Type: application/json`

## 🛠️ Soluciones Rápidas

### Solución 1: Reiniciar Todo

```cmd
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
cd fronted
npm start
```

### Solución 2: Limpiar Cache del Navegador

1. Presiona **Ctrl + Shift + Delete**
2. Selecciona "Cached images and files"
3. Click en "Clear data"
4. Recarga la página (F5)

### Solución 3: Usar Incógnito

1. Abre una ventana de incógnito (Ctrl + Shift + N)
2. Ve a `http://localhost:3000`
3. Prueba la búsqueda

### Solución 4: Verificar que no haya otro proceso en el puerto

```cmd
# Ver qué está usando el puerto 3000
netstat -ano | findstr :3000

# Ver qué está usando el puerto 8000
netstat -ano | findstr :8000
```

## 📸 Qué Deberías Ver

### En la Console (F12 → Console):

```
Searching for: microgravity
API URL: http://localhost:8000
Response status: 200
Search results: {query: "microgravity", total_results: 57, results: Array(20)}
```

### En Network (F12 → Network):

```
Request URL: http://localhost:8000/search
Request Method: POST
Status Code: 200 OK
```

### En la Página:

Después de buscar, deberías ver:
- Título: "Search Results for: **microgravity**"
- "57 papers found" (o el número que devuelva)
- Grid con papers
- Grafo de conocimiento
- Sinopsis del top result

## 🚨 Si Nada Funciona

### Opción 1: Verificar logs del backend

En la terminal donde corre el backend, deberías ver:
```
INFO:     127.0.0.1:xxxxx - "POST /search HTTP/1.1" 200 OK
```

Si no ves esto, el frontend no está llegando al backend.

### Opción 2: Probar con curl

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/search" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"query":"test","top_n":5}'
```

Si esto funciona pero el frontend no, el problema es en el frontend.

### Opción 3: Verificar que HomePage esté pasando la función correctamente

Revisa `fronted/src/components/HomePage.tsx` línea 14:
```typescript
onSearch(searchQuery);
```

Debe llamar a la función `onSearch` que viene de `App.tsx`.

## 📞 Información para Reportar

Si el problema persiste, necesito saber:

1. ✅ ¿El backend está corriendo? (curl funciona)
2. ❓ ¿Qué muestra la **Console** en DevTools?
3. ❓ ¿Qué muestra la pestaña **Network**?
4. ❓ ¿Hay algún error en rojo en la consola?
5. ❓ ¿La petición llega al backend? (ver logs del backend)

---

**Siguiente paso**: Abre DevTools (F12), busca "microgravity", y dime qué aparece en la Console.
