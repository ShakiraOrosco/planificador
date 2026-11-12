import React, { useState, useRef } from 'react';
import { 
  X, 
  HardDrive, 
  Paperclip, 
  Trash2, 
  ExternalLink, 
  Upload, 
  FileText, 
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { Task, TaskPriority, TaskStatus, Attachment } from '../types';
import { googleDriveService } from '../services/googleDrive';

interface TaskModalProps {
  task: Task | null;
  initialStatus?: TaskStatus;
  initialDueDate?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  onOpenDriveSettings: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  initialStatus = 'todo',
  initialDueDate = '',
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  onOpenDriveSettings,
}) => {
  if (!isOpen) return null;

  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || initialStatus);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate || initialDueDate);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [attachments, setAttachments] = useState<Attachment[]>(task?.attachments || []);
  
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);

  const localFileInputRef = useRef<HTMLInputElement>(null);
  const driveUploadInputRef = useRef<HTMLInputElement>(null);

  // Tags management
  const handleAddTag = () => {
    const clean = tagInput.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Google Drive: Open Picker
  const handleOpenGoogleDrivePicker = async () => {
    setDriveError(null);
    if (!googleDriveService.isConfigured()) {
      setDriveError('Google Drive aún no está configurado con tus credenciales.');
      return;
    }

    try {
      setIsDriveLoading(true);
      const pickedFiles = await googleDriveService.openFilePicker();
      if (pickedFiles.length > 0) {
        setAttachments((prev) => [...prev, ...pickedFiles]);
      }
    } catch (err: any) {
      console.error(err);
      setDriveError(err.message || 'Error al conectar con Google Drive');
    } finally {
      setIsDriveLoading(false);
    }
  };

  // Google Drive: Direct upload to Drive
  const handleUploadDirectlyToDrive = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDriveError(null);
    if (!googleDriveService.isConfigured()) {
      setDriveError('Google Drive requiere Client ID y API Key configurados.');
      return;
    }

    try {
      setIsDriveLoading(true);
      const uploadedAttachment = await googleDriveService.uploadFileToDrive(file);
      setAttachments((prev) => [...prev, uploadedAttachment]);
    } catch (err: any) {
      console.error(err);
      setDriveError(err.message || 'Error al subir archivo a Google Drive');
    } finally {
      setIsDriveLoading(false);
      if (driveUploadInputRef.current) driveUploadInputRef.current.value = '';
    }
  };

  // Local File Upload
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newAttachment: Attachment = {
        id: 'local_' + Date.now(),
        name: file.name,
        type: 'local',
        url: reader.result as string,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
      setAttachments((prev) => [...prev, newAttachment]);
    };
    reader.readAsDataURL(file);

    if (localFileInputRef.current) localFileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  // Save form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate || undefined,
      tags,
      attachments,
    };

    if (isEditing && task) {
      onUpdate(task.id, taskPayload);
    } else {
      onSave(taskPayload);
    }

    onClose();
  };

  // Helper file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-850 border border-slate-700/90 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-800/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Título de la tarea *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Implementar dashboard de métricas"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Descripción
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles, objetivos o notas relevantes para la tarea..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
            />
          </div>

          {/* Status, Priority & Due Date (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status (4 Columns) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Columna / Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Fecha de Entrega
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Etiquetas
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Escribe una etiqueta y presiona Enter..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium transition"
              >
                Agregar
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-400 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Archivos y Conexión Google Drive */}
          <div className="pt-2 border-t border-slate-700/80">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-indigo-400" />
                Archivos Adjuntos & Google Drive
              </label>

              {/* Action Buttons for Files */}
              <div className="flex items-center gap-2">
                {/* Google Picker */}
                <button
                  type="button"
                  onClick={handleOpenGoogleDrivePicker}
                  disabled={isDriveLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-medium transition disabled:opacity-50"
                  title="Abrir selector oficial de Google Drive"
                >
                  <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Drive</span>
                </button>

                {/* Upload directly to Drive */}
                <button
                  type="button"
                  onClick={() => driveUploadInputRef.current?.click()}
                  disabled={isDriveLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-medium transition disabled:opacity-50"
                  title="Subir archivo a Google Drive"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Subir a Drive</span>
                </button>

                {/* Local Upload */}
                <button
                  type="button"
                  onClick={() => localFileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
                  title="Adjuntar archivo localmente"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Local</span>
                </button>

                <input
                  ref={localFileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleLocalFileUpload}
                />
                <input
                  ref={driveUploadInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleUploadDirectlyToDrive}
                />
              </div>
            </div>

            {/* Drive loading indicator */}
            {isDriveLoading && (
              <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 mb-3 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Conectando y procesando con Google Drive...</span>
              </div>
            )}

            {/* Drive error notification with config button */}
            {driveError && (
              <div className="flex items-center justify-between gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{driveError}</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenDriveSettings}
                  className="px-2 py-1 bg-rose-600/30 hover:bg-rose-600 text-white rounded-md text-[11px] font-semibold transition shrink-0"
                >
                  Configurar Credenciales
                </button>
              </div>
            )}

            {/* Attachments List */}
            {attachments.length === 0 ? (
              <div className="border border-dashed border-slate-700/80 rounded-xl p-4 text-center text-xs text-slate-500">
                No hay archivos adjuntos en esta tarea. Puedes vincular archivos de Google Drive o subir documentos.
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-700/70 rounded-xl text-xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {file.type === 'google_drive' ? (
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                          <HardDrive className="w-4 h-4 text-blue-400" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-slate-400" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-200 truncate">
                            {file.name}
                          </span>
                          {file.type === 'google_drive' && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0 font-medium">
                              Drive
                            </span>
                          )}
                        </div>
                        {file.size && (
                          <span className="text-[10px] text-slate-500">
                            {formatFileSize(file.size)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                        title="Abrir / Ver archivo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(file.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                        title="Eliminar adjunto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/80">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Seguro que deseas eliminar esta tarea?')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl text-xs font-semibold transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            ) : <div></div>}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Guardar Cambios' : 'Crear Tarea'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
