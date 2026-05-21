/**
 * TaskFilterBar — task-filter-bar.tsx
 *
 * A presentational component that renders all filter/sort controls for the task list.
 *
 * Key patterns demonstrated:
 *
 * 1. **Controlled Components**: Every input (search, selects, buttons) receives
 *    its value from props and notifies changes via callback props. The component
 *    has no internal state — it is fully controlled by the parent (TaskList).
 *
 * 2. **Prop Drilling**: This component receives many props (10+) from TaskList.
 *    In a larger app, you might use Brisa's store or context to avoid passing
 *    so many props through intermediate components.
 *
 * 3. **Tag Filter Chips**: Tags are rendered as toggleable buttons. Clicking a
 *    tag adds or removes it from the selectedTags array, demonstrating
 *    array manipulation in event handlers.
 *
 * 4. **Task Counts**: Computes active/completed counts from the raw tasks
 *    retrieved via getServerTasks, showing real-time statistics.
 */
import type { RequestContext } from 'brisa';
import { getServerTasks } from '@/lib/taskStore';
import { TaskFilter, TaskPriorityFilter, TaskSortBy, TaskSortOrder } from '@/lib/taskModel';

/**
 * Props for TaskFilterBar — all filter state and callbacks are passed from parent.
 *
 * The `on*Change` props are setter functions from Brisa's `state()` hook.
 * When called, they update the signal and trigger a re-render of the parent.
 */
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
  { currentFilter, currentPriorityFilter, searchTerm, sortBy, sortOrder, selectedTags, allTags, onFilterChange, onPriorityFilterChange, onSearchChange, onSortByChange, onSortOrderChange, onTagsChange }: TaskFilterBarProps,
  { store }: RequestContext,
) {
  const tasks = getServerTasks({ store });

  const activeCount = tasks.filter(task => !task.completed).length;
  const completedCount = tasks.filter(task => task.completed).length;

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
        <select
          id="task-priority-filter"
          value={currentPriorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value as TaskPriorityFilter)}
        >
          <option value="all">Все приоритеты</option>
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Теги:</label>
        <div class="tag-filter-chips">
          {allTags.length === 0 ? (
            <span class="no-tags-label">Нет тегов</span>
          ) : (
            allTags.map(tag => (
              <button
                key={tag}
                type="button"
                class={`tag-chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    onTagsChange(selectedTags.filter(t => t !== tag));
                  } else {
                    onTagsChange([...selectedTags, tag]);
                  }
                }}
              >
                #{tag}
              </button>
            ))
          )}
        </div>
      </div>

      <div class="filter-group">
        <label htmlFor="task-sort-by">Сортировать по:</label>
        <select
          id="task-sort-by"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as TaskSortBy)}
        >
          <option value="createdAt">Дата создания</option>
          <option value="dueDate">Срок выполнения</option>
          <option value="priority">Приоритет</option>
          <option value="title">Название</option>
        </select>
      </div>

      <div class="filter-group">
        <label htmlFor="task-sort-order">Порядок:</label>
        <select
          id="task-sort-order"
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as TaskSortOrder)}
        >
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
