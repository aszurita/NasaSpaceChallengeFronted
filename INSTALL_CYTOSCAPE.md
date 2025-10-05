# 📦 Instalación de Cytoscape

## ⚠️ Problema con PowerShell

Si tienes problemas para ejecutar `npm` en PowerShell, sigue estos pasos:

### Opción 1: Usar CMD (Recomendado)

1. Abre **CMD** (Símbolo del sistema) como administrador
2. Navega a la carpeta del frontend:
   ```cmd
   cd "C:\Users\ASUS\OneDrive - Ministerio de Educación\Escritorio\NasaSpaceChallengeFronted - copia\fronted"
   ```
3. Instala Cytoscape:
   ```cmd
   npm install cytoscape
   npm install @types/cytoscape --save-dev
   ```

### Opción 2: Habilitar scripts en PowerShell (Temporal)

1. Abre PowerShell como **Administrador**
2. Ejecuta:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Confirma con `Y`
4. Ahora puedes ejecutar:
   ```powershell
   cd "C:\Users\ASUS\OneDrive - Ministerio de Educación\Escritorio\NasaSpaceChallengeFronted - copia\fronted"
   npm install cytoscape
   npm install @types/cytoscape --save-dev
   ```

### Opción 3: Usar Git Bash o WSL

Si tienes Git Bash o WSL instalado:
```bash
cd "/c/Users/ASUS/OneDrive - Ministerio de Educación/Escritorio/NasaSpaceChallengeFronted - copia/fronted"
npm install cytoscape
npm install @types/cytoscape --save-dev
```

## ✅ Verificar Instalación

Después de instalar, verifica que `package.json` incluya:

```json
{
  "dependencies": {
    "cytoscape": "^3.x.x",
    ...
  },
  "devDependencies": {
    "@types/cytoscape": "^3.x.x",
    ...
  }
}
```

## 🚀 Ejecutar el Proyecto

Una vez instalado Cytoscape:

### Backend
```cmd
cd backend
uvicorn main:app --reload --port 8000
```

### Frontend
```cmd
cd fronted
npm start
```

## 🧪 Probar el Grafo

1. Abre `http://localhost:3000`
2. Busca un paper (ej: "microgravity")
3. Haz click en cualquier paper de los resultados
4. Verás el **Knowledge Graph** interactivo con Cytoscape

## 🎯 Características del Grafo

- ✅ **Interactivo**: Zoom, pan, drag
- ✅ **Nodos de colores**:
  - 🔵 Azul: Paper principal
  - 🟣 Morado: Topics
  - 🌸 Rosa: Organisms
  - 🔷 Celeste: Papers relacionados
- ✅ **Controles**:
  - 🔄 Reset: Resetea la vista
  - 📥 Export: Descarga como PNG
- ✅ **Hover effects**: Resalta nodos al pasar el mouse
- ✅ **Click**: Selecciona y resalta nodos

## 📝 Archivos Creados

- ✅ `fronted/src/components/CytoscapeGraph.tsx` - Componente principal
- ✅ `fronted/src/components/CytoscapeGraph.css` - Estilos
- ✅ `backend/main.py` - Endpoint `/paper/{id}/cytoscape-graph`
- ✅ `backend/cytoscape_graph_example.json` - Ejemplo de JSON

## 🔧 Troubleshooting

### Error: "Cannot find module 'cytoscape'"

Solución: Instala la dependencia:
```cmd
npm install cytoscape
```

### Error: "Could not find a declaration file for module 'cytoscape'"

Solución: Instala los tipos:
```cmd
npm install @types/cytoscape --save-dev
```

### El grafo no se muestra

1. Verifica que el backend esté corriendo en puerto 8000
2. Abre DevTools (F12) → Network
3. Busca la petición a `/paper/{id}/cytoscape-graph`
4. Verifica que devuelva status 200

### El grafo se ve vacío

1. Verifica que el paper tenga un `id` válido
2. Revisa la consola del navegador (F12)
3. Verifica que el endpoint devuelva nodos y edges

## 📚 Documentación

- [Cytoscape.js Docs](https://js.cytoscape.org/)
- [Cytoscape.js Demos](https://js.cytoscape.org/demos/)
- [Layouts](https://js.cytoscape.org/#layouts)

---

**Estado**: ⏳ Pendiente de instalación de dependencias
