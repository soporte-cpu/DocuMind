# Changelog - DocuMind Enterprise

Todas las modificaciones notables de este proyecto se documentarán en este archivo.

## [1.1.0] - 2026-02-25
### v1.1 UI Restoration & User Management
Segunda gran actualización centrada en el refinamiento estético y la seguridad de acceso.

### Añadido
- **Módulo de Administración de Usuarios**: Interfaz completa para crear, editar, eliminar y gestionar roles de usuarios (admin/viewer).
- **Gestión de Sesiones**: Login corporativo mejorado con persistencia de token JWT y redirección automática.
- **Cambio de Contraseña**: Funcionalidad para que administradores gestionen credenciales de forma segura.

### Cambios
- **Restauración Estética Premium**: Retorno al diseño "Light Premium" solicitado, con sidebar corporativo Navy profundo.
- **UX Refinado**: Botones de borrado sutiles (hover), alineación de cabeceras optimizada y selector de contexto fijo al final del sidebar.
- **Mejora en Chat**: Legibilidad aumentada con contraste optimizado para mensajes de usuario y asistente.

### Corregido
- **Error 401 en Chat**: Sincronización del token de seguridad en todas las peticiones fetch.
- **Solapamiento de UI**: Corregidos bugs visuales en la gestión de áreas y subida de archivos.
- **Escritura en Chat**: Resuelto bloqueo que impedía el foco en el cuadro de texto.

## [1.0.0] - 2026-02-25
### v1.0 Release candidate
Esta es la primera versión completa orientada a entornos corporativos (Enterprise).

### Añadido
- **Gestión de Carpetas**: Capacidad de subir estructuras de directorios recursivas.
- **Panel de Progreso**: Interfaz flotante de estado para subidas e indexación RAG con Glassmorphism.
- **Búsqueda Híbrida**: Integración de FAISS + BM25 para mejorar la precisión técnica.
- **Tratamiento Multimedia**: Soporte para indexación de archivos MP3/MP4 vía Whisper.
- **Historial de Chat Avanzado**: Eliminación de chats y generación automática de títulos vía IA.
- **Control de Acceso (RBAC)**: Implementación de roles `admin` y `viewer`.
- **Autenticación JWT**: Sistema de login seguro con tokens persistentes.
- **Protección de Rutas**: Endpoints sensibles (upload, delete) restringidos a administradores.
- **Filtrado de Historial**: Los usuarios solo pueden ver y gestionar sus propias conversaciones.
- **Sesión Corporativa**: Nuevo overlay de login con diseño Enterprise.

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
