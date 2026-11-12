import React from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import type { Task, TaskStatus, ColumnDef } from '../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus, newIndex?: number) => void;
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'bg-blue-400',
    badgeBg: 'bg-blue-500/20 text-blue-300',
    borderClass: 'border-blue-500/30',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    color: 'bg-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300',
    borderClass: 'border-amber-500/30',
  },
  {
    id: 'in_review',
    title: 'In Review',
    color: 'bg-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-300',
    borderClass: 'border-purple-500/30',
  },
  {
    id: 'closed',
    title: 'Closed',
    color: 'bg-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300',
    borderClass: 'border-emerald-500/30',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onMoveTask,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    onMoveTask(draggableId, newStatus, destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="w-full overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-max xl:min-w-0 xl:grid xl:grid-cols-4 items-start">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.id);
            return (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={columnTasks}
                onAddTask={onAddTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            );
          })}
        </div>
      </div>
    </DragDropContext>
  );
};
