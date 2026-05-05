import { describe, expect, it, beforeEach } from 'bun:test';
import { addTask, getTasks, getTaskById, updateTask, deleteTask, clearCompletedTasks, exportTasks, importTasks } from '@/lib/taskStore';

describe('TaskStore', () => {
  it('should initialize with sample tasks', () => {
    const tasks = getTasks();
    expect(tasks.length).toBeGreaterThan(0);
  });

  it('should add a new task', () => {
    const initialCount = getTasks().length;
    const newTask = addTask({
      title: 'Test new task',
      description: 'Test description',
      completed: false,
      priority: 'high',
      tags: ['test'],
    });
    expect(newTask.title).toBe('Test new task');
    expect(newTask.priority).toBe('high');
    expect(getTasks().length).toBe(initialCount + 1);
  });

  it('should get task by id', () => {
    const newTask = addTask({
      title: 'Findable task',
      completed: false,
      priority: 'low',
      tags: [],
    });
    const found = getTaskById(newTask.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe('Findable task');
  });

  it('should update a task', () => {
    const newTask = addTask({
      title: 'Original title',
      completed: false,
      priority: 'medium',
      tags: [],
    });
    const updated = updateTask(newTask.id, { title: 'Updated title', completed: true });
    expect(updated).toBeDefined();
    expect(updated?.title).toBe('Updated title');
    expect(updated?.completed).toBe(true);
  });

  it('should delete a task', () => {
    const newTask = addTask({
      title: 'To be deleted',
      completed: false,
      priority: 'low',
      tags: [],
    });
    const result = deleteTask(newTask.id);
    expect(result).toBe(true);
    expect(getTaskById(newTask.id)).toBeUndefined();
  });

  it('should clear completed tasks', () => {
    addTask({ title: 'Completed 1', completed: true, priority: 'low', tags: [] });
    addTask({ title: 'Completed 2', completed: true, priority: 'medium', tags: [] });
    addTask({ title: 'Active 1', completed: false, priority: 'high', tags: [] });

    clearCompletedTasks();
    const remaining = getTasks();
    expect(remaining.every(t => !t.completed)).toBe(true);
  });

  it('should export tasks as JSON', () => {
    const json = exportTasks();
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });

  it('should import tasks from JSON', () => {
    const json = exportTasks();
    const initialCount = getTasks().length;
    importTasks(json);
    expect(getTasks().length).toBe(initialCount);
  });

  it('should handle tags correctly', () => {
    const task = addTask({
      title: 'Tagged task',
      completed: false,
      priority: 'medium',
      tags: ['work', 'important'],
    });
    expect(task.tags).toEqual(['work', 'important']);
  });
});
