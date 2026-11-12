import React from 'react';
import { Filter, X } from 'lucide-react';
import type { TaskPriority, TaskStatus } from '../types';

interface TaskFiltersProps {
  selectedStatus: TaskStatus | 'all';
  setSelectedStatus: (s: TaskStatus | 'all') => void;
  selectedPriority: TaskPriority | 'all';
  setSelectedPriority: (p: TaskPriority | 'all') => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  allTags: string[];
  totalFiltered: number;
  totalAll: number;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
  selectedTag,
  setSelectedTag,
  allTags,
  totalFiltered,
  totalAll,
}) => {
  const hasActiveFilters = selectedStatus !== 'all' || selectedPriority !== 'all' || selectedTag !== null;

  const clearFilters = () => {
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSelectedTag(null);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5 px-1 text-xs">
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtros:</span>
        </div>

        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value as TaskPriority | 'all')}
          className="bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
        >
          <option value="all">Todas las prioridades</option>
          <option value="urgent">Urgente</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as TaskStatus | 'all')}
          className="bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
        >
          <option value="all">Todos los estados</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="closed">Closed</option>
        </select>

        {/* Tag selector */}
        {allTags.length > 0 && (
          <select
            value={selectedTag || 'all'}
            onChange={(e) => setSelectedTag(e.target.value === 'all' ? null : e.target.value)}
            className="bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="all">Todas las etiquetas</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg border border-slate-700 transition"
          >
            <X className="w-3 h-3" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Task Count info */}
      <div className="text-slate-400 font-medium">
        Mostrando <span className="text-white font-semibold">{totalFiltered}</span> de{' '}
        <span className="text-white font-semibold">{totalAll}</span> tareas
      </div>
    </div>
  );
};
