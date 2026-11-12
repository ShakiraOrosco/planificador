# Planificador Kanban & Calendario con Integración Google Drive

Sistema web moderno y reactivo desarrollado con **React 19 + TypeScript + Vite + Tailwind CSS**, diseñado para gestionar tareas mediante un tablero Kanban interactivo, una vista de calendario sincronizada y conexión con la API oficial de Google Drive.

---

## 🚀 Características Principales

### 1. Tablero Kanban (4 Columnas)
* **To Do:** Tareas pendientes por iniciar.
* **In Progress:** Tareas actualmente en desarrollo o ejecución.
* **In Review:** Tareas en fase de revisión, pruebas o control de calidad.
* **Closed:** Tareas finalizadas y archivadas.
* **Arrastrar y Soltar (Drag & Drop):** Movimiento fluido de tarjetas entre columnas y reordenamiento vertical.
* **Métricas y Contadores:** Contadores automáticos por columna y barra de progreso general.

### 2. Calendario Sincronizado
* **Vista Mensual Completa:** Muestra los días del mes y las tareas asignadas a cada fecha.
* **Chips de Estado:** Cada tarea en el calendario se visualiza con el color correspondiente a su estado en el Kanban.
* **Creación Rápida:** Haz clic en cualquier día del calendario para crear una tarea programada para esa fecha.
* **Panel de Tareas Sin Fecha:** Muestra las tareas que aún no tienen fecha límite y permite asignarlas con un clic.

### 3. Conexión Oficial con Google Drive & Archivos
* **Selector Oficial (Google Picker API):** Explora y vincula documentos, hojas de cálculo, presentaciones, PDFs o imágenes directamente desde tu Google Drive.
* **Subida Directa a Google Drive:** Sube archivos desde tu equipo a tu unidad de Google Drive usando la API REST v3 multipart y los enlaza automáticamente a la tarea.
* **Subida Local (Fallback):** Permite adjuntar archivos directamente en el navegador incluso sin conexión a Google Drive.
* **Previsualización:** Enlaces directos a la vista web de Google Drive para abrir cada documento.

---

## 🛠️ Cómo Iniciar la Aplicación

### Opción 1: Con el archivo directo
Haz doble clic en:
`iniciar.bat`

### Opción 2: Desde la consola
```bash
cd "C:\Users\pas.aorosco\Ayana\PLANIFICADOR"
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`.

---

## 🔑 Configurar las Credenciales Oficiales de Google Drive

1. Abre la aplicación y pulsa el botón **"Google Drive"** en la barra superior.
2. Ve a [Google Cloud Console](https://console.cloud.google.com).
3. Habilita las siguientes APIs en **APIs & Services > Library**:
   * `Google Drive API`
   * `Google Picker API`
4. En **APIs & Services > Credentials**:
   * Crea una **API Key** y pégala en la ventana de configuración.
   * Crea un **OAuth 2.0 Client ID** (tipo *Web Application*), agrega `http://localhost:5173` en **Orígenes de JavaScript autorizados** y pega el Client ID.
5. Haz clic en **Guardar Credenciales** y luego en **Conectar**.

---

## 📂 Estructura del Proyecto

```
PLANIFICADOR/
├── src/
│   ├── components/
│   │   ├── CalendarView.tsx            # Vista de calendario interactivo y bandeja sin fecha
│   │   ├── GoogleDriveConfigModal.tsx  # Configuración OAuth y API Key de Google
│   │   ├── Header.tsx                  # Barra de navegación, búsqueda y cambio de vista
│   │   ├── KanbanBoard.tsx             # Tablero con DragDropContext
│   │   ├── KanbanColumn.tsx            # Columna con Droppable y Draggables
│   │   ├── TaskCard.tsx                # Tarjeta individual con badges e indicadores
│   │   ├── TaskFilters.tsx             # Filtros por estado, prioridad y etiquetas
│   │   └── TaskModal.tsx               # Modal de creación/edición y gestor de adjuntos
│   ├── hooks/
│   │   └── useTasks.ts                 # Estado, persistencia LocalStorage y CRUD
│   ├── services/
│   │   └── googleDrive.ts              # Servicio GIS, Google Picker y upload API v3
│   ├── types/
│   │   └── index.ts                    # Interfaces TypeScript
│   ├── App.tsx                         # Componente raíz
│   ├── index.css                       # Estilos Tailwind CSS
│   └── main.tsx                        # Punto de entrada
├── index.html                          # HTML con scripts de GIS y Google Picker
├── iniciar.bat                         # Lanzador directo para Windows
├── package.json
└── vite.config.ts
```
