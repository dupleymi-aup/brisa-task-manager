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

export function getTasks(): Task[] {
  return Array.from(tasks.values());
}

export function getTaskById(id: string): Task | undefined {
  return tasks.get(id);
}

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

export function deleteTask(id: string): boolean {
  const result = tasks.delete(id);
  if (result) {
    debouncedSaveToLocalStorage(); // Persist to localStorage with debounce
  }
  return result;
}

export function clearCompletedTasks(): void {
  tasks.forEach((task, id) => {
    if (task.completed) {
      tasks.delete(id);
    }
  });
  debouncedSaveToLocalStorage(); // Persist to localStorage with debounce
}

// Export tasks to JSON string
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

// Import tasks from JSON string
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

// Server-side task store functions
export function getServerTasks({ store }: RequestContext): Task[] {
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

export function setServerTasks({ store }: RequestContext, tasksArray: Task[]): void {
  tasks = new Map(tasksArray.map(task => [task.id, task]));
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