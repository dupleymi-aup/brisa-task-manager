import type { RequestContext } from 'brisa';
import { Task } from './taskModel';

// In-memory store for tasks (in a real app, this would be backed by a database)
// Using a Map to store tasks by ID
let tasks: Map<string, Task> = new Map();

// Key for localStorage
const LOCAL_STORAGE_KEY = 'brisa-task-manager-tasks';

// Debounce timer for localStorage saves
let saveTimeout: NodeJS.Timeout | null = null;

// Initialize with some sample tasks if empty
function initializeTasks() {
  if (tasks.size === 0) {
    // Try to load from localStorage first (for client-side persistence)
    if (typeof window !== 'undefined') {
      try {
        const storedTasksJson = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedTasksJson) {
          const parsedTasks = JSON.parse(storedTasksJson) as Task[];
          // Convert string dates back to Date objects
          const taskObjects: Task[] = parsedTasks.map(task => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            tags: task.tags || [] // Ensure tags is an array
          }));
          
          taskObjects.forEach(task => {
            tasks.set(task.id, task);
          });
          return; // Successfully loaded from localStorage
        }
      } catch (e) {
        console.warn('Failed to load tasks from localStorage', e);
      }
    }
    
    // If no localStorage data, use sample tasks
    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Изучить Brisa фреймворк',
        description: 'Познакомиться с основами Brisa для создания full-stack приложений',
        completed: true,
        priority: 'medium' as const,
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
        tags: ['обучение', 'fris']
      },
      {
        id: '2',
        title: 'Создать менеджер задач',
        description: 'Разработать полноценный менеджер задач с возможностью создания, редактирования и удаления задач',
        completed: false,
        priority: 'high' as const,
        createdAt: new Date(Date.now() - 43200000),
        updatedAt: new Date(Date.now() - 43200000),
        tags: ['разработка', 'задачи']
      },
      {
        id: '3',
        title: 'Добавить реальное время обновлений',
        description: 'Реализовать обновления задач в реальном времени с использованием сигналов Brisa',
        completed: false,
        priority: 'medium' as const,
        createdAt: new Date(Date.now() - 21600000),
        updatedAt: new Date(Date.now() - 21600000),
        tags: ['реальное время', 'сигналы']
      }
    ];
    
    sampleTasks.forEach(task => {
      tasks.set(task.id, task);
    });
    
    // Save sample tasks to localStorage
    saveToLocalStorage();
  }
}

// Save tasks to localStorage with debounce
function saveToLocalStorage() {
  if (typeof window !== 'undefined') {
    try {
      const tasksArray = Array.from(tasks.values());
      // Convert Date objects to ISO strings for JSON serialization
      const serializableTasks = tasksArray.map(task => ({
        ...task,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        tags: task.tags
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serializableTasks));
    } catch (e) {
      console.warn('Failed to save tasks to localStorage', e);
    }
  }
}

// Debounced save function
function debouncedSaveToLocalStorage() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(() => {
    saveToLocalStorage();
    saveTimeout = null;
  }, 300); // Wait 300ms after last change before saving
}

// Initialize tasks on module load
initializeTasks();

/**
 * Returns all tasks currently in the store.
 * @returns Array of all Task objects
 */
export function getTasks(): Task[] {
  return Array.from(tasks.values());
}

/**
 * Retrieves a single task by its ID.
 * @param id - The unique identifier of the task
 * @returns The Task if found, undefined otherwise
 */
export function getTaskById(id: string): Task | undefined {
  return tasks.get(id);
}

/**
 * Creates a new task with auto-generated ID and timestamps.
 * Persists to localStorage with debounced save.
 * @param task - Task data without id, createdAt, or updatedAt (these are auto-generated)
 * @returns The newly created Task with all fields populated
 */
export function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
  const now = new Date();
  const newTask: Task = {
    ...task,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: now,
    updatedAt: now,
    tags: task.tags || [] // Ensure tags is present
  };
  
  tasks.set(newTask.id, newTask);
  debouncedSaveToLocalStorage(); // Persist to localStorage with debounce
  return newTask;
}

/**
 * Updates an existing task with the given changes.
 * Automatically sets updatedAt to the current time.
 * Persists to localStorage with debounced save.
 * @param id - The ID of the task to update
 * @param updates - Partial task object with fields to update
 * @returns The updated Task, or undefined if the task was not found
 */
export function updateTask(id: string, updates: Partial<Task>): Task | undefined {
  const task = tasks.get(id);
  if (!task) return undefined;
  
  const updatedTask = {
    ...task,
    ...updates,
    updatedAt: new Date()
  };
  
  tasks.set(id, updatedTask);
  debouncedSaveToLocalStorage(); // Persist to localStorage with debounce
  return updatedTask;
}

/**
 * Deletes a task by its ID.
 * Persists to localStorage with debounced save.
 * @param id - The ID of the task to delete
 * @returns true if the task was found and deleted, false otherwise
 */
export function deleteTask(id: string): boolean {
  const result = tasks.delete(id);
  if (result) {
    debouncedSaveToLocalStorage(); // Persist to localStorage with debounce
  }
  return result;
}

/**
 * Removes all completed tasks from the store.
 * Persists to localStorage with debounced save.
 */
export function clearCompletedTasks(): void {
  tasks.forEach((task, id) => {
    if (task.completed) {
      tasks.delete(id);
    }
  });
  debouncedSaveToLocalStorage(); // Persist to localStorage with debounce
}

/**
 * Exports all tasks as a formatted JSON string.
 * Date objects are serialized to ISO strings for portability.
 * @returns JSON string representation of all tasks
 */
export function exportTasks(): string {
  const tasksArray = Array.from(tasks.values());
  const serializableTasks = tasksArray.map(task => ({
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    tags: task.tags
  }));
  return JSON.stringify(serializableTasks, null, 2);
}

/**
 * Imports tasks from a JSON string, replacing all existing tasks.
 * Each task's ID is preserved from the import data or auto-generated if missing.
 * @param json - JSON string containing an array of task objects
 * @throws Error if the JSON is invalid or task data is malformed
 */
export function importTasks(json: string): void {
  try {
    const parsedTasks = JSON.parse(json) as Array<Partial<Task> & {
      createdAt: string;
      updatedAt: string;
      dueDate?: string | null;
    }>;
    
    // Clear existing tasks
    tasks.clear();
    
    // Parse and add imported tasks
    parsedTasks.forEach(taskData => {
      const task: Task = {
        ...taskData,
        createdAt: new Date(taskData.createdAt),
        updatedAt: new Date(taskData.updatedAt),
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        tags: taskData.tags || []
      };
      
      // Ensure ID exists (generate if missing)
      if (!task.id) {
        task.id = Math.random().toString(36).substr(2, 9);
      }
      
      tasks.set(task.id, task);
    });
    
    // Save to localStorage
    saveToLocalStorage();
  } catch (e) {
    console.error('Failed to import tasks', e);
    throw new Error('Invalid task data format');
  }
}

/**
 * Server-side function to retrieve tasks from the Brisa store.
 * Handles initialization if no tasks exist in the store yet.
 * Transfers tasks to the client for hydration.
 *
 * In tests (where store is unavailable), returns tasks from the in-memory Map.
 * @param context - Brisa RequestContext providing access to the server store
 * @returns Array of all Task objects
 */
export function getServerTasks({ store }: RequestContext): Task[] {
  // Handle case when store is not available (e.g., in tests)
  if (!store || typeof store.transferToClient !== 'function') {
    return Array.from(tasks.values());
  }
  // Get tasks from store, or initialize if not present
  let storedTasks = store.get('tasks') as Task[] | undefined;
  
  if (storedTasks) {
    // Convert stored tasks back to Task objects and update our local map
    tasks = new Map(storedTasks.map(task => [task.id, task]));
  } else {
    // Initialize with sample tasks if none exist
    initializeTasks();
    // Store initial tasks
    storedTasks = Array.from(tasks.values());
    store.set('tasks', storedTasks);
  }
  
  // Transfer tasks to client
  store.transferToClient(['tasks']);
  
  return Array.from(tasks.values());
}

/**
 * Server-side function to save tasks to the Brisa store.
 * Updates the in-memory Map, server store, and transfers to client.
 * Also persists to localStorage when running in a browser environment.
 *
 * Call this after any mutation (add/update/delete) to keep all stores in sync.
 * @param context - Brisa RequestContext providing access to the server store
 * @param tasksArray - Complete array of tasks to store
 */
export function setServerTasks({ store }: RequestContext, tasksArray: Task[]): void {
  tasks = new Map(tasksArray.map(task => [task.id, task]));
  if (!store) return;
  store.set('tasks', tasksArray);
  store.transferToClient(['tasks']);
  
  // Also save to localStorage for client-side persistence (with debounce)
  if (typeof window !== 'undefined') {
    debouncedSaveToLocalStorage();
  }
}

// Cleanup function to save any pending changes before unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveToLocalStorage(); // Save immediately on unload
    }
  });
}