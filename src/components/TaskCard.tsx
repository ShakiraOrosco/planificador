import React from 'react';
import { 
  Calendar, 
  Paperclip, 
  HardDrive, 
  Trash2, 
  Edit3, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import type { Task, TaskPriority } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityConfig: Record<TaskPriority, { label: string; bg: string; text: string; border: string }> = {
  urgent: { label: 'Urgente', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
  high: { label: 'Alta', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  medium: { label: 'Media', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  low: { label: 'Baja', bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const hasDriveAttachment = task.attachments.some((a) => a.type === 'google_drive');

  // Calculate overdue status
  const getDueDateInfo = (dueDate?: string) => {
    if (!dueDate) return null;
    const today = new Date().toISOString().split('T')[0];
    const isOverdue = dueDate < today && task.status !== 'closed';
    const isToday = dueDate === today;

    // Formatting date
    const parts = dueDate.split('-');
    const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}` : dueDate;

    return {
      text: isToday ? 'Hoy' : formatted,
      isOverdue,
      isToday,
    };
  };

  const dueInfo = getDueDateInfo(task.dueDate);

  return (
    <div
      onClick={() => onEdit(task)}
      className="group bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer relative"
    >
      {/* Top row: Priority & Quick Actions */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${priority.bg} ${priority.text} ${priority.border}`}
        >
          {priority.label}
        </span>

        {/* Hover Action buttons */}
        <div 
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-700/60 rounded transition"
            title="Editar tarea"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded transition"
            title="Eliminar tarea"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Title */}
      <h3 className={`text-sm font-semibold text-slate-100 leading-snug line-clamp-2 mb-1.5 ${task.status === 'closed' ? 'line-through text-slate-400' : ''}`}>
        {task.title}
      </h3>

      {/* Description Snippet (if available) */}
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-700/70 text-slate-300 border border-slate-600/50"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row: Due Date & Attachments */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
        {/* Due date */}
        {dueInfo ? (
          <div
            className={`flex items-center gap-1.5 font-medium ${
              dueInfo.isOverdue
                ? 'text-rose-400 font-semibold'
                : dueInfo.isToday
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400'
            }`}
            title={`Fecha límite: ${task.dueDate}`}
          >
            {dueInfo.isOverdue ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Calendar className="w-3.5 h-3.5" />
            )}
            <span>{dueInfo.text}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            <Clock className="w-3 h-3" />
            <span>Sin fecha</span>
          </div>
        )}

        {/* Attachments Indicator */}
        {task.attachments.length > 0 && (
          <div className="flex items-center gap-1.5 text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded-md border border-slate-600/40">
            {hasDriveAttachment ? (
              <span title="Contiene archivos de Google Drive" className="inline-flex items-center">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              </span>
            ) : (
              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="text-[11px] font-medium">{task.attachments.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};
