import { useState, useMemo } from 'react';
import type { Task, TaskPriority, TaskStatus, ViewMode } from './types';
import { useTasks } from './hooks/useTasks';
import { googleDriveService } from './services/googleDrive';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { TaskModal } from './components/TaskModal';
import { GoogleDriveConfigModal } from './components/GoogleDriveConfigModal';
import { TaskFilters } from './components/TaskFilters';

export function App() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    updateTaskDueDate,
  } = useTasks();

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatusForNewTask, setDefaultStatusForNewTask] = useState<TaskStatus>('todo');
  const [defaultDueDateForNewTask, setDefaultDueDateForNewTask] = useState<string>('');

  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [driveConfigVersion, setDriveConfigVersion] = useState(0);

  // Drive state
  const isDriveConfigured = useMemo(() => {
    return googleDriveService.isConfigured();
  }, [driveConfigVersion]);

  const isDriveAuthenticated = useMemo(() => {
    return googleDriveService.isAuthenticated();
  }, [driveConfigVersion]);

  // All unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((t) => t.tags?.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }

      // Status
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;

      // Priority
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

      // Tag
      if (selectedTag && !t.tags?.includes(selectedTag)) return false;

      return true;
    });
  }, [tasks, searchQuery, selectedStatus, selectedPriority, selectedTag]);

  // Stats
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'closed').length, [tasks]);

  // Open task modal handlers
  const handleOpenNewTask = (status: TaskStatus = 'todo', dueDate: string = '') => {
    setEditingTask(null);
    setDefaultStatusForNewTask(status);
    setDefaultDueDateForNewTask(dueDate);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        onNewTask={() => handleOpenNewTask()}
        onOpenDriveSettings={() => setIsDriveModalOpen(true)}
        isDriveConfigured={isDriveConfigured}
        isDriveAuthenticated={isDriveAuthenticated}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalTasks={tasks.length}
        completedTasks={completedTasks}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {/* Filters Bar */}
        <TaskFilters
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          allTags={allTags}
          totalFiltered={filteredTasks.length}
          totalAll={tasks.length}
        />

        {/* View Switch */}
        <div className="flex-1">
          {viewMode === 'kanban' ? (
            <KanbanBoard
              tasks={filteredTasks}
              onMoveTask={moveTask}
              onAddTask={(status) => handleOpenNewTask(status)}
              onEditTask={handleEditTask}
              onDeleteTask={deleteTask}
            />
          ) : (
            <CalendarView
              tasks={filteredTasks}
              onSelectTask={handleEditTask}
              onAddTaskWithDate={(date) => handleOpenNewTask('todo', date)}
              onUpdateDueDate={updateTaskDueDate}
            />
          )}
        </div>
      </main>

      {/* Task Creation / Editing Modal */}
      <TaskModal
        task={editingTask}
        initialStatus={defaultStatusForNewTask}
        initialDueDate={defaultDueDateForNewTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={addTask}
        onUpdate={updateTask}
        onDelete={deleteTask}
        onOpenDriveSettings={() => {
          setIsTaskModalOpen(false);
          setIsDriveModalOpen(true);
        }}
      />

      {/* Google Drive Configuration & OAuth Modal */}
      <GoogleDriveConfigModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onConfigUpdated={() => setDriveConfigVersion((v) => v + 1)}
      />
    </div>
  );
}

export default App;
