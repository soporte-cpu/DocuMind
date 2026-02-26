# Changelog - DocuMind Enterprise

Todas las modificaciones notables de este proyecto se documentarán en este archivo.

## [1.4.0] - 2026-02-26
### v1.4.0 Area Intelligence & Precision
Quinta actualización enfocada en convertir la gestión documental en inteligencia accionable proactiva.

### Añadido
- **Area Intelligence Dash**: Panel dinámico que genera un resumen ejecutivo automático de cada carpeta usando GPT-4o.
- **Auto-Discovery de Temas**: Extracción inteligente de hashtags técnicos y conceptos clave propios de cada área.
- **Preguntas Sugeridas Inteligentes**: Botones interactivos que proponen consultas relevantes basadas en el contenido real de los documentos de la carpeta.

### Mejoras (UI/UX)
- **Responsive Mobile Elite v2**: Sistema de menús laterales ocultos con botón toggle (☰) optimizado para controles táctiles y pantallas pequeñas.
- **Viewport Lock**: Configuración de escalado fijo para evitar deformaciones visuales en navegadores móviles.
- **Animaciones de Carga Flint**: Micro-animaciones para el estado de generación de resúmenes inteligentes.

## [1.3.0] - 2026-02-26
### v1.3.0 Audit & UX Elite
Cuarta gran actualización enfocada en la experiencia de auditoría profesional y la diferenciación visual del flujo de trabajo.

### Añadido
- **Descargas Seguras Universales**: Implementación de un extractor de tokens de doble vía (URL + Headers) que garantiza la descarga de documentos originales sin fallos de seguridad.
- **Motor de Resaltado V7 (Smart-Focus)**: Nueva lógica que ignora automáticamente palabras de pregunta (Qué, Cómo, Cuál) y prioriza términos técnicos y siglas en la auditoría visual.
- **Estructura Modal "Sticky Controls"**: Rediseño del visor de documentos con encabezado y botones de acción fijos, permitiendo scroll infinito sin perder el botón de descarga o cierre.
- **Ruta Técnica de Favicon**: Implementación de endpoint dedicado para el icono de la web, eliminando errores 404 en la depuración.

### Cambios (UI/UX)
- **Rediseño Asimétrico del Chat**: Interfaz estilo mensajería moderna con mensajes de usuario a la derecha (azul vibrante) y respuestas de la IA a la izquierda (blanco elegante).
- **Restauración de Login Premium**: Corrección de proporciones y etiquetas en la pantalla de acceso para mantener la estética Enterprise solicitada.
- **URL Encoding de Documentos**: Los archivos con nombres complejos (espacios, tildes) ahora se descargan con total fiabilidad técnica.

### Corregido (Auditoría)
- **Filtro de Relevancia Quirúrgico**: Eliminación total de documentos "ruido". El sistema ahora exige validación cruzada entre la pregunta original y el contenido técnico para mostrar una fuente.
- **Error 500 en Consultas**: Solucionado fallo de servidor durante el procesamiento de filtros de relevancia avanzados.
- **Sincronización de Identidad**: Corregido bug que impedía la descarga por discrepancia en el nombre de la llave de sesión (`documind_token`).

## [1.2.1] - 2026-02-26
### v1.2.1 Consistency Patch
Mejoras de estabilidad en la recuperación para evitar inconsistencias en preguntas repetidas.

### Corregido
- **Consistencia de Recuperación**: Optimización del contextualizador para mantener términos técnicos originales (ej: POSPac) y evitar fallos por sobre-interpretación.
- **Rango de Búsqueda (k=15)**: Aumento de la ventana de análisis para asegurar visibilidad de datos técnicos incluso con ruido documental.
- **Recuperación Híbrida Balanceada**: Ajuste de pesos 50/50 entre búsqueda vectorial y palabra clave exacta.

## [1.2.0] - 2026-02-26
### v1.2 RAG Precision & Monitoring
Tercera gran actualización enfocada en la fiabilidad de las respuestas técnicas y la visibilidad del estado del sistema.

### Añadido
- **Panel de Progreso en Tiempo Real**: Notificaciones estilo Glassmorphism para monitorear subidas e indexación (RAG) en directo.
- **Botón de Reprocesamiento Integral**: Función para reconstruir toda la base de conocimientos con un solo clic.
- **Extractor de Tablas DOCX**: Soporte completo para leer datos estructurados dentro de tablas de Microsoft Word.
- **Visualizador de Citas Expandido**: Modal profesional para ver el fragmento exacto del documento de donde proviene la información.

### Mejoras de Inteligencia (RAG)
- **Chunking Quirúrgico**: Ajuste del tamaño de fragmentación a 800 caracteres para mejor balance entre contexto y precisión.
- **Filtro de Relevancia Semántica**: Las fuentes ahora se filtran automáticamente para eliminar ruidos y documentos irrelevantes en la respuesta.
- **Prompt de Auditoría Técnica**: Refinamiento del motor para citar datos técnicos textualmente y mejorar el conteo de elementos.
- **Búsqueda Híbrida Optimizada**: Aumento del margen de recuperación (k=12) y ajuste de pesos para términos técnicos exactos.

### Correciones (UI/UX)
- **Refinamiento de Historial**: Botón de eliminar chat rediseñado con animaciones más suaves y símbolo más nítido.
- **Deduplicación de Fuentes**: Agrupación inteligente de etiquetas de documentos para evitar saturación visual.

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
