/**
 * TaskList — task-list.tsx
 *
 * This is the central server component of the Task Manager. It demonstrates:
 *
 * 1. **Server Component with State**: Uses Brisa's `state()` hook (from WebContext)
 *    to manage UI state (filters, sort) on the client side while the component
 *    itself renders on the server.
 *
 * 2. **Server Store Integration**: Calls `getServerTasks({ store })` to retrieve
 *    tasks from the Brisa server store, ensuring data consistency across re-renders.
 *
 * 3. **Client-Side Filtering & Sorting**: All filtering and sorting happens in
 *    memory on each render. This is fine for small datasets but would need
 *    database-level filtering for large task lists.
 *
 * 4. **CRUD Handlers**: Each handler (toggle, delete, update, clear) follows
 *    the same pattern: mutate → save to store → rerender. The `rerenderInAction`
 *    call triggers a server-side re-render of this component.
 *
 * 5. **Component Composition**: Renders TaskForm, TaskFilterBar, and TaskItem
 *    as children, passing callbacks for interactivity.
 *
 * Key Brisa concepts:
 * - RequestContext: First parameter — provides server-side store and request info
 * - WebContext: Second parameter — provides client-side state() and signals
 * - rerenderInAction({ type: 'targetComponent' }): Re-render only this component
 *   after a state change, avoiding full-page re-renders
 */
import type { RequestContext, WebContext } from 'brisa';
import { rerenderInAction } from 'brisa/server';
import { Task, TaskFilter, TaskPriorityFilter, TaskSortBy, TaskSortOrder } from '@/lib/taskModel';
import { getTasks, updateTask, deleteTask, clearCompletedTasks, getServerTasks, setServerTasks } from '@/lib/taskStore';
import TaskItem from './task-item';
import TaskFilterBar from './task-filter-bar';
import TaskForm from './task-form';

export default function TaskList(
  { store }: RequestContext,
  { state }: WebContext,
) {
  // Get tasks from server store — this is our source of truth.
  // getServerTasks handles initialization if the store is empty.
  const allTasks = getServerTasks({ store });

  // ─── UI State ──────────────────────────────────────────────────────────────
  // Each `state()` call creates a reactive signal. When the signal's `.value`
  // changes, Brisa knows which parts of the UI need to update.
  // These signals live on the client side even though the component renders
  // on the server — this is the "islands of interactivity" pattern.
  const [currentFilter, setCurrentFilter] = state<TaskFilter>('all');
  const [currentPriorityFilter, setCurrentPriorityFilter] = state<TaskPriorityFilter>('all');
  const [searchTerm, setSearchTerm] = state<string>('');
  const [sortBy, setSortBy] = state<TaskSortBy>('createdAt');
  const [sortOrder, setSortOrder] = state<TaskSortOrder>('desc');
  const [selectedTags, setSelectedTags] = state<string[]>([]);

  // ─── Filtering ─────────────────────────────────────────────────────────────
  // Filters are applied in sequence. A task must pass ALL filters to appear.
  // This runs on every render — for large datasets, move filtering to the DB.
  const filteredTasks = allTasks.filter(task => {
    // Completion filter
    const matchesCompletion = 
      currentFilter === 'all' || 
      (currentFilter === 'active' && !task.completed) || 
      (currentFilter === 'completed' && task.completed);
    
    // Priority filter
    const matchesPriority = 
      currentPriorityFilter === 'all' || 
      task.priority === currentPriorityFilter;
    
    // Search filter
    const matchesSearch = 
      searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Tags filter
    const matchesTags = 
      selectedTags.length === 0 || 
      selectedTags.every(tag => task.tags.includes(tag));
    
    return matchesCompletion && matchesPriority && matchesSearch && matchesTags;
  });

  // ─── Sorting ───────────────────────────────────────────────────────────────
  // Create a shallow copy with spread operator before sorting, because
  // Array.sort() mutates in place. We must never mutate allTasks directly
  // as it comes from the server store.
  //
  // Special handling:
  // - priority: mapped to numbers (high=3, medium=2, low=1) for numeric comparison
  // - dueDate: undefined values sort to Infinity (always at the end)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    const sortValueA = a[sortBy];
    const sortValueB = b[sortBy];

    // Handle different types
    if (sortBy === 'priority') {
      // Convert priority to numeric for sorting: high=3, medium=2, low=1
      const priorityMap: Record<Task['priority'], number> = { high: 3, medium: 2, low: 1 };
      const numA = priorityMap[sortValueA];
      const numB = priorityMap[sortValueB];
      comparison = numA - numB;
    } else if (sortBy === 'dueDate') {
      // Handle undefined dueDate (always put at the end)
      const dateA = sortValueA ? sortValueA.getTime() : Infinity;
      const dateB = sortValueB ? sortValueB.getTime() : Infinity;
      comparison = dateA - dateB;
    } else if (sortBy === 'createdAt') {
      comparison = sortValueA.getTime() - sortValueB.getTime();
    } else if (sortBy === 'title') {
      comparison = sortValueA.localeCompare(sortValueB);
    }

    // Apply sort order
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // ─── CRUD Handlers ─────────────────────────────────────────────────────────
  // Each handler follows the same 3-step pattern:
  // 1. Mutate data via taskStore function
  // 2. Sync the server store with setServerTasks(getTasks())
  // 3. Trigger a re-render with rerenderInAction

  /** Toggle a task's completion status */
  function handleToggleComplete(task: Task) {
    // Update on server
    const updatedTask = updateTask(task.id, { completed: !task.completed });
    if (updatedTask) {
      // Update server store with current state
      setServerTasks({ store }, getTasks());

      // Trigger rerender
      rerenderInAction({ type: 'targetComponent' });
    }
  }

  /** Delete a task by ID */
  function handleDeleteTask(id: string) {
    // Delete from server
    const deleted = deleteTask(id);
    if (deleted) {
      // Update server store with current state
      setServerTasks({ store }, getTasks());

      // Trigger rerender
      rerenderInAction({ type: 'targetComponent' });
    }
  }

  /** Update an existing task with new data (called from TaskItem edit mode) */
  function handleUpdateTask(updatedTask: Task) {
    // Update on server
    const task = updateTask(updatedTask.id, {
      title: updatedTask.title,
      description: updatedTask.description,
      priority: updatedTask.priority,
      dueDate: updatedTask.dueDate,
      tags: updatedTask.tags
    });
    if (task) {
      // Update server store with current state
      setServerTasks({ store }, getTasks());

      // Trigger rerender
      rerenderInAction({ type: 'targetComponent' });
    }
  }

  /** Remove all completed tasks from the store */
  function handleClearCompleted() {
    // Clear from server
    clearCompletedTasks();

    // Update server store with current state
    setServerTasks({ store }, getTasks());

    // Trigger rerender
    rerenderInAction({ type: 'targetComponent' });
  }

  // Get all unique tags from tasks for the filter dropdown
  const allTags = Array.from(new Set(
    allTasks.flatMap(task => task.tags)
  )).sort();

  return (
    <div class="task-list">
      <h2>Задачи</h2>
      <TaskForm { ...{ store } } />
      <TaskFilterBar
        currentFilter={currentFilter}
        currentPriorityFilter={currentPriorityFilter}
        searchTerm={searchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
        selectedTags={selectedTags}
        allTags={allTags}
        onFilterChange={setCurrentFilter}
        onPriorityFilterChange={setCurrentPriorityFilter}
        onSearchChange={setSearchTerm}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        onTagsChange={setSelectedTags}
        { ...{ store } }
      />

      {sortedTasks.length === 0 ? (
        <p class="no-tasks">Задач пока нет. Добавьте первую задачу!</p>
      ) : (
        <>
          <div class="task-stats">
            <span class="task-count">
              {allTasks.filter(t => !t.completed).length} из {allTasks.length} задач
            </span>
            <button
              class="clear-completed"
              onClick={handleClearCompleted}
              disabled={allTasks.every(t => !t.completed)}
            >
              Очистить выполненные
            </button>
          </div>

          <ul class="task-list-items">
            {sortedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onUpdate={handleUpdateTask}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}