# DocuMind Enterprise v1.1.0 🚀

DocuMind Enterprise es una plataforma de gestión documental inteligente potenciada por Inteligencia Artificial y arquitectura RAG (Retrieval-Augmented Generation). Permite organizar documentos por áreas, realizar búsquedas híbridas (semántica + técnica) y chatear con los documentos para obtener respuestas precisas y profesionales.

## 🌟 Características Principales

### 🧠 Inteligencia Artificial y RAG
- **Búsqueda Híbrida**: Combina la potencia semántica de FAISS (Vectores) con la precisión técnica de BM25 (Keyword search).
- **Contextualización Dinámica**: El sistema reformula preguntas basándose en el historial para mantener la coherencia del chat.
- **Títulos Inteligentes**: Generación automática de títulos profesionales para cada conversación mediante LLM.
- **Soporte Multiformato**: Procesa PDF, DOCX, XLSX, PPTX, TXT, HTML e incluso archivos de audio/video (MP3/MP4) mediante transcripción con Whisper.

### 📂 Gestión Documental Profesional
- **Áreas de Trabajo**: Organización de documentos en espacios separados (ej: Procedimientos Técnicos, Aspectos Ambientales).
- **Carga de Carpetas**: Soporte para subida recursiva de directorios completos, manteniendo la estructura de carpetas original.
- **Monitoreo en Tiempo Real**: Panel de progreso con Glassmorphism que muestra el estado de subida e indexación en segundo plano.
- **Sincronización Inteligente**: La base de datos se sincroniza automáticamente con el sistema de archivos físico.

### 🎨 Interfaz de Usuario (UI/UX)
- **Diseño Enterprise Premium**: Estética corporativa balanceada (Light/Dark Navy) con efectos de desenfoque y sombras sutiles.
- **Botones Inteligentes**: Controles de borrado que solo aparecen al interactuar (hover) para mantener la limpieza visual.
- **Historial de Chat**: Gestión completa de conversaciones con capacidad de cambio rápido y eliminación persistente.

### 👥 Administración y Usuarios (Nuevo v1.1)
- **Gestión de Perfiles**: Panel exclusivo para administradores para crear, editar y eliminar usuarios.
- **Control de Roles**: Implementación de permisos diferenciados (`Admin` para gestión total, `Viewer` para solo consultas).
- **Seguridad Robusta**: Hash de contraseñas con bcrypt y autenticación mediante persistencia de tokens JWT.
- **Estado Dinámico**: Control de cuentas activas/inactivas con impacto inmediato en el acceso.

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **IA/LLM**: LangChain, OpenAI (GPT-4o & Text-Embeddings-3-Small)
- **Base de Datos**: SQLite con SQLAlchemy ORM
- **Vector Store**: FAISS
- **Retrieval**: Ensemble Retriever (FAISS + BM25)

### Frontend
- **Arquitectura**: Vanilla HTML5, CSS3 (Custom Properties & Animations), JavaScript ES6+
- **Estilo**: Diseño responsive con efectos de Glassmorphism y desenfoque (Backdrop Filter).

### Utilidades
- **Transcripción**: OpenAI Whisper (para archivos multimedia)
- **Procesamiento de Doc**: PyPDF2, python-docx, openpyxl, python-pptx.

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/documind-enterprise.git
cd documind-enterprise
```

### 2. Configurar entorno virtual
```bash
python -m venv venv
venv\Scripts\activate  # En Windows
source venv/bin/activate  # En Linux/Mac
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto y añade tu API Key:
```env
OPENAI_API_KEY=tu_clave_aqui
```

### 5. Ejecutar la aplicación
```bash
uvicorn backend.main:app --reload
```

### 🐳 Despliegue con Docker (Recomendado)
Para un despliegue rápido y persistente que incluya la base de datos y todos los archivos:

```bash
docker-compose up -d --build
```
Esto levantará el contenedor con volúmenes persistentes para `docs/`, `embeddings/` y la base de datos `documind.db`.
La aplicación estará disponible en `http://localhost:8000`.

## 📖 Uso de la API

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/chat` | POST | Envía una consulta al asistente RAG. |
| `/history` | GET | Lista todas las sesiones de chat guardadas. |
| `/history/{sid}` | DELETE | Elimina una sesión de chat y sus mensajes. |
| `/areas` | GET | Lista todas las áreas de trabajo. |
| `/upload` | POST | Sube archivos o carpetas a un área específica. |
| `/indexing-status`| GET | Consulta si el sistema está procesando archivos. |

## 🛠️ Estructura del Proyecto

```
documind-enterprise/
├── backend/            # Lógica del servidor y utilidades RAG
│   ├── main.py         # Endpoints de la API
│   ├── models.py       # Modelos de base de datos
│   ├── ingest_utils.py # Procesamiento de documentos
│   └── database.py     # Configuración de SQLite
├── frontend/           # Archivos estáticos
│   ├── index.html      # Estructura principal
│   ├── script.js       # Lógica cliente
│   └── style.css       # Estilos y animaciones
├── docs/               # Almacenamiento físico de documentos
├── embeddings/         # Índices vectoriales FAISS
└── .env                # Configuración sensible
```

---
**Versión 1.0.0** - Desarrollado con ❤️ por Pheer.
