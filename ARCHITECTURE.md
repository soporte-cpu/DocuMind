# Arquitectura de DocuMind Enterprise 🧠

DocuMind Enterprise utiliza una arquitectura de **Generación Aumentada por Recuperación (RAG)** híbrida, diseñada para ofrecer alta precisión técnica y semántica.

## 🏗️ Componentes Principales

### 1. Backend (FastAPI)
- **Motor de Ingesta**: Procesa documentos (PDF, DOCX, XLSX, etc.) y los divide en fragmentos significativos (chunks) usando `RecursiveCharacterTextSplitter`.
- **Búsqueda Híbrida**: Combina dos tipos de recuperación para maximizar resultados:
    - **Semántica (FAISS)**: Utiliza embeddings de OpenAI para entender el contexto y significado.
    - **Léxica (BM25)**: Busca coincidencias exactas de términos técnicos y siglas, evitando que la IA "alucine" con términos similares pero incorrectos.
- **Gestión de Sesiones**: Almacena el historial de chat en SQLite para mantener la coherencia en conversaciones largas.

### 2. Base de Datos (SQLAlchemy + SQLite)
- **Usuarios**: Gestión de roles (Admin/Viewer) y autenticación JWT.
- **Chats y Mensajes**: Almacenamiento persistente de conversaciones y métricas de uso de tokens.
- **Áreas**: Relación entre carpetas físicas en el disco y metadatos en la base de datos.

### 3. Frontend (Vanilla JS + CSS Custom)
- **Single Page Application**: Una interfaz fluida sin frameworks pesados, optimizada para velocidad.
- **Visualización Proactiva**: El frontend detecta bloques de código **Mermaid** generados por la IA y los renderiza automáticamente como diagramas.

## 🔄 Flujo de una Consulta
1. El usuario envía una pregunta.
2. El sistema recupera los últimos mensajes de la base de datos para dar contexto.
3. Se realiza una búsqueda híbrida (80% FAISS, 20% BM25).
4. El LLM (`gpt-4o-mini`) recibe la pregunta + contexto + historial.
5. Se genera una respuesta técnica con citación de fuentes verificables.
6. El consumo de tokens se registra para análisis administrativo.

## 📂 Estructura de Datos
- `/docs`: Almacenamiento de archivos originales organizados por carpetas (Áreas).
- `/embeddings`: Índices vectoriales FAISS y cache de texto BM25.
- `/data`: Base de datos relacional SQLite.
- `/transcripts`: Cache de transcripciones para archivos multimedia.
