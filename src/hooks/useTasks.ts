import { useState, useEffect } from 'react';
import type { Task, TaskStatus, Attachment } from '../types';

const STORAGE_KEY_TASKS = 'kanban_tasks_data';

const getInitialTasks = (): Task[] => {
  const today = new Date();
  const formatOffset = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'task-1',
      title: 'Definir especificaciones técnicas de la API',
      description: 'Documentar endpoints, autenticación OAuth2 y esquemas de datos para la sincronización con servicios externos.',
      status: 'todo',
      priority: 'high',
      tags: ['Backend', 'Documentación', 'API'],
      dueDate: formatOffset(1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [
        {
          id: 'sample-drive-1',
          name: 'Especificaciones_Tecnicas.docx',
          type: 'google_drive',
          url: 'https://docs.google.com',
          mimeType: 'application/vnd.google-apps.document',
          iconUrl: 'https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_document_x16.png',
          uploadedAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'task-2',
      title: 'Diseñar arquitectura de base de datos',
      description: 'Diagrama entidad-relación y definición de tablas para el almacenamiento de tareas y relaciones de proyectos.',
      status: 'todo',
      priority: 'medium',
      tags: ['Base de Datos', 'Arquitectura'],
      dueDate: formatOffset(4),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
    },
    {
      id: 'task-3',
      title: 'Integrar autenticación Google Identity Services',
      description: 'Implementar el flujo de token client con scopes de Drive para lectura y subida segura de archivos.',
      status: 'in_progress',
      priority: 'urgent',
      tags: ['Seguridad', 'Google Drive', 'Frontend'],
      dueDate: formatOffset(2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [
        {
          id: 'sample-drive-2',
          name: 'Credenciales_Guia.pdf',
          type: 'google_drive',
          url: 'https://drive.google.com',
          mimeType: 'application/pdf',
          iconUrl: 'https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_pdf_x16.png',
          uploadedAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'task-4',
      title: 'Desarrollar vistas del calendario mensual y semanal',
      description: 'Permitir visualización por cuadrícula mensual con badges de estado y sincronización automática de fechas límite.',
      status: 'in_progress',
      priority: 'high',
      tags: ['UI', 'Calendario', 'React'],
      dueDate: formatOffset(3),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
    },
    {
      id: 'task-5',
      title: 'Revisión de accesibilidad y contraste en interfaz',
      description: 'Validar ratio de contraste en modo oscuro, navegación con teclado y compatibilidad con lectores de pantalla.',
      status: 'in_review',
      priority: 'medium',
      tags: ['QA', 'Accesibilidad', 'Diseño'],
      dueDate: formatOffset(-1), // Ayer (vencida)
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
    },
    {
      id: 'task-6',
      title: 'Configuración de entorno de desarrollo y Vite',
      description: 'Inicialización del proyecto con React 19, TypeScript, Tailwind CSS y soporte para módulos ESM.',
      status: 'closed',
      priority: 'low',
      tags: ['DevOps', 'Setup'],
      dueDate: formatOffset(-3),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
    },
  ];
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parseando tareas guardadas:', e);
      }
    }
    return getInitialTasks();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const moveTask = (taskId: string, newStatus: TaskStatus, newIndex?: number) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;

      const otherTasks = prev.filter((t) => t.id !== taskId);
      const updatedTask = { ...task, status: newStatus, updatedAt: new Date().toISOString() };

      if (typeof newIndex === 'number') {
        // Obtenemos las tareas que ya están en el status destino
        const statusTasks = otherTasks.filter((t) => t.status === newStatus);
        const nonStatusTasks = otherTasks.filter((t) => t.status !== newStatus);

        statusTasks.splice(newIndex, 0, updatedTask);
        return [...statusTasks, ...nonStatusTasks];
      }

      return [updatedTask, ...otherTasks];
    });
  };

  const updateTaskDueDate = (taskId: string, newDate?: string) => {
    updateTask(taskId, { dueDate: newDate });
  };

  const addAttachment = (taskId: string, attachment: Attachment) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              attachments: [...t.attachments, attachment],
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const removeAttachment = (taskId: string, attachmentId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              attachments: t.attachments.filter((a) => a.id !== attachmentId),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const resetToSampleData = () => {
    const initial = getInitialTasks();
    setTasks(initial);
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    updateTaskDueDate,
    addAttachment,
    removeAttachment,
    resetToSampleData,
  };
};
