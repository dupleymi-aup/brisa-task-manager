import type { WebContext } from 'brisa';
import { Task } from './taskModel';

// We'll try to import signal from brisa
// If it doesn't exist, we'll fall back to a simple observable
let signal: any;
try {
  // @ts-ignore: We don't know if Brisa exports a signal function
  const { signal } = await import('brisa');
} catch (e) {
  console.warn('Brisa signal not available, using fallback');
  signal = null;
}

// Fallback signal implementation
class FallbackSignal<T> {
  private _value: T;
  private subscribers: Array<(value: T) => void> = [];

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    this._value = newValue;
    this.subscribers.forEach(sub => sub(newValue));
  }

  subscribe(subscriber: (value: T) => void) {
    this.subscribers.push(subscriber);
    // Call immediately with current value
    subscriber(this._value);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== subscriber);
    };
  }
}

// Use Brisa signal if available, otherwise fallback
const createSignal = <T>(initialValue: T) => {
  if (signal && typeof signal === 'function') {
    // @ts-ignore: Assume Brisa's signal function
    return signal(initialValue);
  } else {
    return new FallbackSignal<T>(initialValue);
  }
};

// Client-side task store using a signal
const tasksSignal = createSignal<Task[]>([]);

// Initialize with some sample tasks (in a real app, this would come from the server)
function initializeClientTasks() {
  const sampleTasks: Task[] = [
    {
      id: '1',
      title: 'Изучить Brisa фреймворк',
      description: 'Познакомиться с основами Brisa для создания full-stack приложений',
      completed: true,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      id: '2',
      title: 'Создать менеджер задач',
      description: 'Разработать полноценный менеджер задач с возможностью создания, редактирования и удаления задач',
      completed: false,
      createdAt: new Date(Date.now() - 43200000),
      updatedAt: new Date(Date.now() - 43200000),
    },
    {
      id: '3',
      title: 'Добавить реальное время обновлений',
      description: 'Реализовать обновления задач в реальном времени с использованием сигналов Brisa',
      completed: false,
      createdAt: new Date(Date.now() - 21600000),
      updatedAt: new Date(Date.now() - 21600000),
    }
  ];
  
  tasksSignal.value = sampleTasks;
}

// Initialize on module load (in client environment)
if (typeof window !== 'undefined') {
  initializeClientTasks();
}

export function useTasks() {
  // In a real Brisa app, we might use a hook to subscribe to the signal
  // For now, we'll return the current value and a setter
  // Note: This is not a proper Brisa hook, just a placeholder
  return {
    tasks: tasksSignal.value,
    setTasks: (tasks: Task[]) => { tasksSignal.value = tasks; },
    subscribe: (callback: (tasks: Task[]) => void) => {
      return tasksSignal.subscribe(callback);
    }
  };
}

export function addTaskClient(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
  const now = new Date();
  const newTask: Task = {
    ...task,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: now,
    updatedAt: now
  };
  
  tasksSignal.value = [...tasksSignal.value, newTask];
  return newTask;
}

export function updateTaskClient(id: string, updates: Partial<Task>): Task | undefined {
  const index = tasksSignal.value.findIndex(t => t.id === id);
  if (index === -1) return undefined;
  
  const updatedTask = {
    ...tasksSignal.value[index],
    ...updates,
    updatedAt: new Date()
  };
  
  const newTasks = [...tasksSignal.value];
  newTasks[index] = updatedTask;
  tasksSignal.value = newTasks;
  
  return updatedTask;
}

export function deleteTaskClient(id: string): boolean {
  const initialLength = tasksSignal.value.length;
  tasksSignal.value = tasksSignal.value.filter(t => t.id !== id);
  return tasksSignal.value.length !== initialLength;
}

export function clearCompletedTasksClient(): void {
  tasksSignal.value = tasksSignal.value.filter(t => !t.completed);
}