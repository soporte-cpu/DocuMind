# DocuMind Enterprise v1.5.1 🚀

DocuMind Enterprise es una plataforma de gestión documental inteligente potenciada por Inteligencia Artificial y arquitectura RAG (Retrieval-Augmented Generation). Permite organizar documentos por áreas, realizar búsquedas híbridas (semántica + técnica) y chatear con los documentos para obtener respuestas precisas y profesionales con citación verificable.

---

### 🗺️ Visión Estratégica y Progreso
*   **[Ver Hoja de Ruta (ROADMAP.md)](./ROADMAP.md)** - Explora los planes para la v2.0 "Compliance Engine".
*   **[Historial de Cambios (CHANGELOG.md)](./CHANGELOG.md)** - Revisa las últimas mejoras de la v1.5.1.

---

## 🌟 Características Destacadas (v1.4.0)

### ✨ Inteligencia de Área Proactiva (Nuevo)
- **Area Intelligence Dash**: Generación automática de resúmenes ejecutivos al entrar en cualquier carpeta.
- **Top Temas Clave**: Identificación rápida de conceptos técnicos y hashtags temáticos por área.
- **Preguntas Sugeridas**: La IA propone consultas inteligentes basadas en el contenido real de tus archivos.

### 🧐 Motor de Auditoría Inteligente (Smart-Focus V7)
- **Resaltado Selectivo**: La IA ignora la gramática común y se enfoca en términos técnicos y siglas críticas.
- **Citas Verificables**: Visualizador de documentos con "Sticky Controls" para una navegación fluida en documentos extensos.
- **Filtro de Relevancia Quirúrgico**: Eliminación automática de fuentes irrelevantes (ruido) para mayor precisión.

### 🎨 Experiencia de Usuario Élite
- **Chat Asimétrico**: Diseño estilo mensajería moderna con mensajes de usuario a la derecha y respuestas de la IA a la izquierda.
- **Descargas Seguras Universales**: Sistema infalible de descarga de archivos originales mediante validación dual (Token URL + Header).
- **Login Premium Restaurado**: Interfaz de acceso profesional, equilibrada y moderna.

### 🧠 Inteligencia Artificial y RAG
- **Búsqueda Híbrida**: FAISS (Vectores) + BM25 (Palabras clave) para una precisión técnica sin igual.
- **Soporte Multiformato**: PDF, DOCX, XLSX, PPTX, TXT, HTML y transcripción multimedia (MP3/MP4).

---

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **IA/LLM**: LangChain, OpenAI (GPT-4o-mini & Text-Embeddings-3-Small)
- **Vector Store**: FAISS

### Frontend
- **Arquitectura**: Vanilla HTML5, CSS3, JavaScript ES6+
- **Estilo**: Diseño Enterprise con Glassmorphism y animaciones fluidas.

---

## 🚀 Instalación y Ejecución Rápida

### 🐳 Con Docker (Recomendado)
```bash
docker-compose up -d --build
```
La aplicación estará disponible en `http://localhost:8000`.

### Desarrollo Local
1. Instalar dependencias: `pip install -r requirements.txt`
2. Configurar `.env` con su `OPENAI_API_KEY`.
3. Iniciar servidor: `uvicorn backend.main:app --reload`

---

## 🛠️ Estructura del Proyecto
```
documind-enterprise/
├── backend/            # Lógica del servidor y utilidades RAG
├── frontend/           # Interfaz de usuario (HTML/CSS/JS)
├── docs/               # Almacenamiento físico de documentos
├── embeddings/         # Índices vectoriales FAISS
└── ROADMAP.md          # Visión de futuro (análisis de brechas)
```

---
*Desarrollado con pasión por **Juan Pablo Erices** & Antigravity AI - v1.5.1 Speed Edition*
