export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];
}

export type TaskFilter = 'all' | 'active' | 'completed';
export type TaskSortBy = 'createdAt' | 'dueDate' | 'priority' | 'title';
export type TaskSortOrder = 'asc' | 'desc';

export interface TaskFilters {
  showCompleted: boolean;
  showActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'all';
  searchTerm: string;
  sortBy: TaskSortBy;
  sortOrder: TaskSortOrder;
  tags: string[]; // Filter by tags (empty array means no filter)
}