# 🚀 Roadmap DocuMind: Versión 2.0 "Compliance Engine"

Este documento detalla la hoja de ruta estratégica para evolucionar DocuMind de un sistema de búsqueda RAG a una plataforma profesional de **Cumplimiento Normativo y Análisis de Brechas (Gap Analysis)**.

---

## 🎯 Objetivo General
Transformar DocuMind en una herramienta que permita a las empresas subir estándares de certificación (ISO, Leyes, Requerimientos Técnicos) y compararlos automáticamente contra su base de conocimientos interna para identificar qué falta por cumplir.

---

## 🛣️ Fases de Desarrollo

### Fase 1: Motor de Comparación y Metadatos (El Cerebro)
*   **Gestión de Estándares Maestros**: Nueva sección para subir documentos de referencia (Reglas de Cumplimiento).
*   **Extracción Automática de Metadatos (Smart Tagger)**: Uso de IA para identificar fechas de vencimiento, entidades, tipos de documento y estados (firmado/pendiente) al momento de la carga.
*   **Segmentación por Cláusulas**: Parser inteligente para identificar requisitos específicos dentro de los estándares.
*   **Análisis de Evidencia Cross-Document**: Lógica de IA que busca pruebas para cada punto de la norma usando metadatos como filtro de veracidad.

### Fase 2: Módulo "Compliance Dashboard" (La Interfaz)
*   **Matriz de Cumplimiento (Semáforo)**: visualización 🟢🟡🔴 basada en la evidencia encontrada.
*   **Timeline de Eventos**: Línea de tiempo automática basada en las fechas extraídas de los metadatos de los documentos.
*   **Auditoría Interactiva**: Al hacer clic en un requerimiento, mostrar el fragmento exacto del documento de la empresa.

### Fase 3: Generación de Informes y Acción (El Valor Agregado)
*   **Gap Report Generativo**: Creación de reportes ejecutivos (PDF/DOCX) con resumen de brechas.
*   **Gestión de Alertas**: Notificaciones automáticas cuando un metadato de "vencimiento" esté próximo a cumplirse.
*   **Asistente de Redacción de Políticas**: Sugerencias de texto inicial para procedimientos faltantes.

---

## 📅 Sprint Actual (Versión 1.5.3)

| Tarea | Detalle | Estado |
| :--- | :--- | :--- |
| **Area Intelligence Dash** | Resúmenes automáticos y temas clave por carpeta. | ✅ Completado |
| **Responsive Mobile v2** | Menús colapsables y diseño táctil optimizado. | ✅ Completado |
| **Pestaña "Normativa"** | Interfaz inicial para gestionar estándares. | 🗓️ Pendiente |
| **Filtros Avanzados** | Búsqueda RAG filtrada por año o estado del documento. | 🗓️ Pendiente |
| **Prompt de Análisis de Brecha** | Lógica RAG especializada en comparación de normas. | 🗓️ Pendiente |

---

## 💡 Ideas en Evaluación
*   **Notificaciones de Vencimiento**: Alerta sobre documentos que deben actualizarse según la norma.
*   **Score de Preparación**: Un porcentaje de "Listo para certificación" en tiempo real.

---

## ❓ Levantamiento de Requisitos (Pre-arranque v2.0)

> Estas preguntas deben responderse con los stakeholders antes de iniciar el desarrollo de la Fase 1.

### 1. Sobre el Estándar / Norma
- ¿Qué tipo de certificación o normativa se quiere analizar? *(ISO 9001, ISO 14001, ISO 45001, ley local, requerimiento de cliente, norma interna)*
- ¿El documento del estándar está disponible en formato PDF, Word u otro?
- ¿El estándar tiene cláusulas numeradas? *(ej: "4.1 Contexto de la organización")* — clave para la segmentación automática.

### 2. Sobre los Documentos Internos
- ¿Qué tipo de documentos se usarán como evidencia de cumplimiento? *(procedimientos, registros, manuales, actas, certificados)*
- ¿Ya están organizados en áreas dentro de DocuMind, o se cargarán específicamente para este módulo?

### 3. Sobre el Resultado Final
- ¿El reporte de brecha es para uso interno *(toma de decisiones)* o para presentar a un auditor externo?
- ¿Se necesita exportar el resultado? *(PDF formal, Excel de checklist, Word editable)*
- ¿Cuántas personas usarán este módulo? *(individual, equipo, clientes)*

### 4. Sobre el Nivel de Automatización
- ¿Se quiere que la IA realice toda la comparación de forma automática, o el usuario también podrá marcar manualmente el estado de cumplimiento?
- ¿Hay un flujo de aprobación antes de generar el reporte final? *(revisor/auditor interno)*

---
*Documento generado y mantenido por el equipo de ingeniería de DocuMind.*
