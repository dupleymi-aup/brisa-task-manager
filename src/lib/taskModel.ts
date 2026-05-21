/**
 * Represents a single task in the task manager.
 *
 * Tasks are the core data entity of the application. Each task has a title,
 * optional description, priority level, completion status, and optional due date.
 * Tags allow for flexible categorification beyond the single priority field.
 */
export interface Task {
  /** Unique identifier for the task, auto-generated on creation */
  id: string;
  /** The main title/summary of the task */
  title: string;
  /** Optional detailed description of the task */
  description?: string;
  /** Whether the task has been completed */
  completed: boolean;
  /** Priority level: low (green), medium (orange), or high (red) */
  priority: 'low' | 'medium' | 'high';
  /** Timestamp when the task was created */
  createdAt: Date;
  /** Timestamp of the last modification */
  updatedAt: Date;
  /** Optional deadline for task completion. Used for overdue detection */
  dueDate?: Date;
  /** List of free-form tags for flexible categorization (e.g., 'работа', 'учёба') */
  tags: string[];
}

/** Filter for task completion status */
export type TaskFilter = 'all' | 'active' | 'completed';

/** Filter for task priority level */
export type TaskPriorityFilter = 'all' | 'low' | 'medium' | 'high';

/** Field used for sorting tasks */
export type TaskSortBy = 'createdAt' | 'dueDate' | 'priority' | 'title';

/** Sort direction */
export type TaskSortOrder = 'asc' | 'desc';

/**
 * Combined filter configuration for the task list.
 * Used by TaskFilterBar and task-list.tsx to filter and sort tasks.
 */
export interface TaskFilters {
  /** Show only completed tasks when true, hide them when false (combined with showActive) */
  showCompleted: boolean;
  /** Show only uncompleted tasks when true */
  showActive: boolean;
  /** Filter by specific priority level, or 'all' to show all priorities */
  priority: 'low' | 'medium' | 'high' | 'all';
  /** Text search term matched against title and description */
  searchTerm: string;
  /** Field to sort tasks by */
  sortBy: TaskSortBy;
  /** Sort direction */
  sortOrder: TaskSortOrder;
  /** List of tags to filter by — tasks must have at least one matching tag */
  tags: string[];
}