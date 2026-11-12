import React from 'react';
import { 
  Kanban, 
  Calendar as CalendarIcon, 
  Plus, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Sparkles
} from 'lucide-react';
import type { ViewMode } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onNewTask: () => void;
  onOpenDriveSettings: () => void;
  isDriveConfigured: boolean;
  isDriveAuthenticated: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  totalTasks: number;
  completedTasks: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  onNewTask,
  onOpenDriveSettings,
  isDriveConfigured,
  isDriveAuthenticated,
  searchQuery,
  setSearchQuery,
  totalTasks,
  completedTasks,
}) => {
  return (
    <header className="bg-slate-800/90 backdrop-blur border-b border-slate-700/80 sticky top-0 z-30 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo and title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Planificador Pro
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Kanban & Calendario
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                {completedTasks} de {totalTasks} tareas completadas
              </p>
            </div>
          </div>

          {/* View Mode Switcher (Mobile) */}
          <div className="flex md:hidden bg-slate-900/80 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-medium transition ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md text-xs font-medium transition ${
                viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher (Desktop) & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar tareas, etiquetas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 text-sm text-slate-200 pl-9 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500 transition"
            />
          </div>

          {/* Desktop tabs */}
          <div className="hidden md:flex bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Kanban className="w-4 h-4" />
              Tablero
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                viewMode === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendario
            </button>
          </div>
        </div>

        {/* Actions & Integrations */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Google Drive Status & Button */}
          <button
            onClick={onOpenDriveSettings}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isDriveAuthenticated
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : isDriveConfigured
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white'
            }`}
            title="Configuración de Google Drive"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Google Drive</span>
            {isDriveAuthenticated ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : isDriveConfigured ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            )}
          </button>

          {/* New Task Button */}
          <button
            onClick={onNewTask}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Nueva Tarea
          </button>
        </div>

      </div>
    </header>
  );
};
