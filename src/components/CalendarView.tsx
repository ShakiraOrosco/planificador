import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  HardDrive, 
  Paperclip,
  Clock,
  ArrowRight
} from 'lucide-react';
import type { Task, TaskStatus } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onAddTaskWithDate: (date: string) => void;
  onUpdateDueDate: (taskId: string, newDate: string) => void;
}

const statusConfig: Record<TaskStatus, { label: string; dot: string; pill: string; border: string }> = {
  todo: { 
    label: 'To Do', 
    dot: 'bg-blue-400', 
    pill: 'bg-blue-500/20 text-blue-200 hover:bg-blue-500/30', 
    border: 'border-blue-500/30' 
  },
  in_progress: { 
    label: 'In Progress', 
    dot: 'bg-amber-400', 
    pill: 'bg-amber-500/20 text-amber-200 hover:bg-amber-500/30', 
    border: 'border-amber-500/30' 
  },
  in_review: { 
    label: 'In Review', 
    dot: 'bg-purple-400', 
    pill: 'bg-purple-500/20 text-purple-200 hover:bg-purple-500/30', 
    border: 'border-purple-500/30' 
  },
  closed: { 
    label: 'Closed', 
    dot: 'bg-emerald-400', 
    pill: 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 line-through', 
    border: 'border-emerald-500/30' 
  },
};

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onSelectTask,
  onAddTaskWithDate,
  onUpdateDueDate,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Generate days for current month grid
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Adjust so Monday is 0 and Sunday is 6
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const calendarCells = [];

  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: dayNum,
      isCurrentMonth: false,
      dateString: dateStr,
    });
  }

  // Current month days
  const todayStr = new Date().toISOString().split('T')[0];

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: i,
      isCurrentMonth: true,
      dateString: dateStr,
      isToday: dateStr === todayStr,
    });
  }

  // Next month leading days to complete full grid (multiple of 7)
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: i,
      isCurrentMonth: false,
      dateString: dateStr,
    });
  }

  // Filter tasks with no due date
  const unscheduledTasks = tasks.filter((t) => !t.dueDate);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Main Calendar Panel */}
      <div className="flex-1 bg-slate-850 rounded-2xl border border-slate-700/80 p-5 shadow-sm">
        
        {/* Calendar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-400" />
              {MONTH_NAMES[month]} {year}
            </h2>
            <button
              onClick={goToToday}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 hover:border-slate-600 transition"
            >
              Hoy
            </button>
          </div>

          {/* Month buttons & Status legend */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-3 mr-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                <span className="text-slate-400">To Do</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="text-slate-400">In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <span className="text-slate-400">In Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-400">Closed</span>
              </div>
            </div>

            <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white transition"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white transition"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-slate-400 uppercase py-2 tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell, idx) => {
            const dayTasks = tasks.filter((t) => t.dueDate === cell.dateString);

            return (
              <div
                key={idx}
                onClick={() => {
                  if (cell.isCurrentMonth) {
                    onAddTaskWithDate(cell.dateString);
                  }
                }}
                className={`min-h-[110px] rounded-xl border p-2 flex flex-col transition-all group relative cursor-pointer ${
                  cell.isCurrentMonth
                    ? cell.isToday
                      ? 'bg-indigo-950/20 border-indigo-500/50 shadow-inner ring-1 ring-indigo-500/30'
                      : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600'
                    : 'bg-slate-900/40 border-slate-800/50 opacity-40 hover:opacity-70'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      cell.isToday
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500'
                        : cell.isCurrentMonth
                        ? 'text-slate-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Add task button on hover */}
                  {cell.isCurrentMonth && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddTaskWithDate(cell.dateString);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                      title="Agregar tarea en este día"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Task Pills */}
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[85px] pr-0.5">
                  {dayTasks.map((t) => {
                    const st = statusConfig[t.status];
                    const hasDrive = t.attachments.some((a) => a.type === 'google_drive');

                    return (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(t);
                        }}
                        className={`text-[11px] font-medium px-1.5 py-0.5 rounded border transition flex items-center justify-between gap-1 group/pill ${st.pill} ${st.border}`}
                        title={`${t.title} (${st.label})`}
                      >
                        <span className="truncate flex-1">{t.title}</span>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {hasDrive ? (
                            <HardDrive className="w-2.5 h-2.5 text-blue-300" />
                          ) : t.attachments.length > 0 ? (
                            <Paperclip className="w-2.5 h-2.5 opacity-70" />
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Panel: Tareas sin fecha & Asignación Rápida */}
      <div className="w-full lg:w-80 bg-slate-850 rounded-2xl border border-slate-700/80 p-5 flex flex-col shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Tareas Sin Fecha
            </h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {unscheduledTasks.length}
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Asigna rápidamente una fecha de vencimiento para vincular estas tareas al calendario.
        </p>

        {/* Unscheduled Tasks List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[500px] pr-1">
          {unscheduledTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-700/80 rounded-xl">
              ¡Todas las tareas tienen fecha programada!
            </div>
          ) : (
            unscheduledTasks.map((task) => {
              const st = statusConfig[task.status];
              return (
                <div
                  key={task.id}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl p-3 text-xs transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-slate-200 truncate flex-1">
                      {task.title}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${st.dot}`}></span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
                    <button
                      onClick={() => onSelectTask(task)}
                      className="text-[11px] text-slate-400 hover:text-indigo-300 transition"
                    >
                      Ver detalle
                    </button>

                    {/* Quick schedule for today or tomorrow */}
                    <button
                      onClick={() => onUpdateDueDate(task.id, todayStr)}
                      className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-md border border-indigo-500/30 transition"
                      title="Asignar para hoy"
                    >
                      <span>Programar Hoy</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
