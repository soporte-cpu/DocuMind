# Changelog - DocuMind Enterprise

Todas las modificaciones notables de este proyecto se documentarán en este archivo.

## [1.0.0] - 2026-02-25
### v1.0 Release candidate
Esta es la primera versión completa orientada a entornos corporativos (Enterprise).

### Añadido
- **Gestión de Carpetas**: Capacidad de subir estructuras de directorios recursivas.
- **Panel de Progreso**: Interfaz flotante de estado para subidas e indexación RAG con Glassmorphism.
- **Búsqueda Híbrida**: Integración de FAISS + BM25 para mejorar la precisión técnica.
- **Tratamiento Multimedia**: Soporte para indexación de archivos MP3/MP4 vía Whisper.
- **Historial de Chat Avanzado**: Eliminación de chats y generación automática de títulos vía IA.
- **Estructura de Áreas**: Capacidad de crear, renombrar y eliminar espacios de trabajo.
- **Confirmaciones**: Diálogos de seguridad para todas las acciones destructivas.

### Cambios
- **Refactorización de UI**: Migración a un diseño premium "Enterprise" con estilos balanceados y fuentes modernas (Inter/Outfit).
- **Backend Optimizado**: La indexación ahora ocurre en segundo plano (BackgroundTasks) para no bloquear la interfaz.
- **Persistencia**: Migración completa a SQLite para historial y gestión de áreas.

### Corregido
- Problemas de distorsión en la cuadrícula de archivos (ahora con tamaños fijos y alineados).
- Bugs en la eliminación de sesiones de chat.
- Errores de sincronización entre carpetas físicas y base de datos.
- Fallo en la selección de archivos individuales tras implementar carpetas.

## [0.5.0] - 2026-02-15
### Pre-alpha - Estructura Básica
- Implementación inicial del motor FastAPI y LangChain.
- Sistema básico de subida de archivos individuales (.pdf, .txt).
- Interfaz básica de chat sin historial persistente.
- Búsqueda vectorial simple con FAISS.

---
*Hecho con Antigravity AI*
