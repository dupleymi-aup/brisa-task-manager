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
  // Get tasks from server store
  const allTasks = getServerTasks({ store });

  // UI state using Brisa's state
  const [currentFilter, setCurrentFilter] = state<TaskFilter>('all');
  const [currentPriorityFilter, setCurrentPriorityFilter] = state<TaskPriorityFilter>('all');
  const [searchTerm, setSearchTerm] = state<string>('');
  const [sortBy, setSortBy] = state<TaskSortBy>('createdAt');
  const [sortOrder, setSortOrder] = state<TaskSortOrder>('desc');
  const [selectedTags, setSelectedTags] = state<string[]>([]);

  // Apply filters
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

  // Apply sorting
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
      // Handle undefined dueDate (put them at the end)
      const dateA = sortValueA ? sortValueA.getTime() : (sortOrder === 'asc' ? Infinity : -Infinity);
      const dateB = sortValueB ? sortValueB.getTime() : (sortOrder === 'asc' ? Infinity : -Infinity);
      comparison = dateA - dateB;
    } else if (sortBy === 'createdAt') {
      comparison = sortValueA.getTime() - sortValueB.getTime();
    } else if (sortBy === 'title') {
      comparison = sortValueA.localeCompare(sortValueB);
    }

    // Apply sort order
    return sortOrder === 'asc' ? comparison : -comparison;
  });

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