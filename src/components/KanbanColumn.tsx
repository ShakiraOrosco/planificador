import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import type { Task, TaskStatus, ColumnDef } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  column: ColumnDef;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  return (
    <div className="flex flex-col bg-slate-850 rounded-2xl border border-slate-700/70 p-3.5 min-w-[280px] w-full max-w-sm flex-1 shadow-sm">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full ${column.color}`}></span>
          <h2 className="text-sm font-bold text-slate-200 tracking-wide">
            {column.title}
          </h2>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${column.badgeBg}`}>
            {tasks.length}
          </span>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          title={`Agregar tarea a ${column.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-2.5 min-h-[450px] p-1 rounded-xl transition-colors ${
              snapshot.isDraggingOver ? 'bg-slate-800/60 ring-2 ring-indigo-500/30' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(providedDraggable, snapshotDraggable) => (
                  <div
                    ref={providedDraggable.innerRef}
                    {...providedDraggable.draggableProps}
                    {...providedDraggable.dragHandleProps}
                    className={`transition-transform ${
                      snapshotDraggable.isDragging ? 'rotate-1 shadow-2xl scale-[1.02]' : ''
                    }`}
                  >
                    <TaskCard
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* Empty state hint */}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div
                onClick={() => onAddTask(column.id)}
                className="h-32 border-2 border-dashed border-slate-700/70 hover:border-slate-600 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-slate-400 text-xs gap-1.5 cursor-pointer transition"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar tarea</span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
