export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'closed';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Attachment {
  id: string;
  name: string;
  type: 'google_drive' | 'local';
  url: string;
  mimeType?: string;
  iconUrl?: string;
  size?: number;
  driveFileId?: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueDate?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
}

export interface ColumnDef {
  id: TaskStatus;
  title: string;
  color: string;
  badgeBg: string;
  borderClass: string;
}

export interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
  appId?: string;
}

export type ViewMode = 'kanban' | 'calendar';
