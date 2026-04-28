import type { RequestContext, WebContext } from 'brisa';
import { rerenderInAction } from 'brisa/server';
import { getServerTasks } from '@/lib/taskStore';
import { Task } from '@/lib/taskModel';

export type TaskFilter = 'all' | 'active' | 'completed';
export type TaskPriorityFilter = 'all' | 'low' | 'medium' | 'high';
export type TaskSortBy = 'createdAt' | 'dueDate' | 'priority' | 'title';
export type TaskSortOrder = 'asc' | 'desc';

interface TaskFilterBarProps {
  currentFilter: TaskFilter;
  currentPriorityFilter: TaskPriorityFilter;
  searchTerm: string;
  sortBy: TaskSortBy;
  sortOrder: TaskSortOrder;
  selectedTags: string[];
  allTags: string[];
  onFilterChange: (filter: TaskFilter) => void;
  onPriorityFilterChange: (priority: TaskPriorityFilter) => void;
  onSearchChange: (term: string) => void;
  onSortByChange: (sortBy: TaskSortBy) => void;
  onSortOrderChange: (sortOrder: TaskSortOrder) => void;
  onTagsChange: (tags: string[]) => void;
}

export default function TaskFilterBar(
  {
    currentFilter,
    currentPriorityFilter,
    searchTerm,
    sortBy,
    sortOrder,
    selectedTags,
    allTags,
    onFilterChange,
    onPriorityFilterChange,
    onSearchChange,
    onSortByChange,
    onSortOrderChange,
    onTagsChange
  }: TaskFilterBarProps,
  { store }: RequestContext,
) {
  // Get tasks from server to determine counts
  const tasks = getServerTasks({ store });

  // Calculate counts based on current filters (for display)
  const filteredTasks = tasks.filter(task => {
    const matchesCompletion =
      currentFilter === 'all' ||
      (currentFilter === 'active' && !task.completed) ||
      (currentFilter === 'completed' && task.completed);

    const matchesPriority =
      currentPriorityFilter === 'all' ||
      task.priority === currentPriorityFilter;

    const matchesSearch =
      searchTerm === '' ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every(tag => task.tags.includes(tag));

    return matchesCompletion && matchesPriority && matchesSearch && matchesTags;
  });

  const activeCount = tasks.filter(task => !task.completed).length;
  const completedCount = tasks.filter(task => task.completed).length;

  const priorityCounts = {
    low: tasks.filter(t => t.priority === 'low').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    high: tasks.filter(t => t.priority === 'high').length,
  };

  return (
    <div class="task-filter-bar">
      <div class="filter-group">
        <label htmlFor="task-search">Поиск:</label>
        <input
          type="text"
          id="task-search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по заголовку или описанию..."
        />
      </div>

      <div class="filter-group">
        <label htmlFor="task-priority-filter">Приоритет:</label>
        <select id="task-priority-filter" value={currentPriorityFilter} onChange={(e) => onPriorityFilterChange(e.target.value as TaskPriorityFilter)}>
          <option value="all">Все приоритеты</option>
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
      </div>

      <div class="filter-group">
        <label htmlFor="task-tags-filter">Теги:</label>
        <select id="task-tags-filter" multiple>
          <option value="">Все теги</option>
          {allTags.map(tag => (
            <option
              key={tag}
              value={tag}
              selected={selectedTags.includes(tag)}
            >
              #{tag}
            </option>
          ))}
        </select>
      </div>

      <div class="filter-group">
        <label htmlFor="task-sort-by">Сортировать по:</label>
        <select id="task-sort-by" value={sortBy} onChange={(e) => onSortByChange(e.target.value as TaskSortBy)}>
          <option value="createdAt">Дата создания</option>
          <option value="dueDate">Срок выполнения</option>
          <option value="priority">Приоритет</option>
          <option value="title">Название</option>
        </select>
      </div>

      <div class="filter-group">
        <label htmlFor="task-sort-order">Порядок:</label>
        <select id="task-sort-order" value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value as TaskSortOrder)}>
          <option value="asc">По возрастанию</option>
          <option value="desc">По убыванию</option>
        </select>
      </div>

      <div class="filter-group completion-filter">
        <button
          class={`filter-button ${currentFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          Все ({tasks.length})
        </button>
        <button
          class={`filter-button ${currentFilter === 'active' ? 'active' : ''}`}
          onClick={() => onFilterChange('active')}
        >
          Активные ({activeCount})
        </button>
        <button
          class={`filter-button ${currentFilter === 'completed' ? 'active' : ''}`}
          onClick={() => onFilterChange('completed')}
        >
          Выполненные ({completedCount})
        </button>
      </div>
    </div>
  );
}