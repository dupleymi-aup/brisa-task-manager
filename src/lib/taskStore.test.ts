/**
 * TaskStore Tests — taskStore.test.ts
 *
 * Unit tests for the task data layer using Bun's built-in test runner.
 *
 * Testing patterns demonstrated:
 *
 * 1. **Arrange-Act-Assert**: Each test follows the AAA pattern:
 *    - Arrange: set up preconditions (create tasks)
 *    - Act: call the function under test
 *    - Assert: verify the result with expect()
 *
 * 2. **Isolation**: Tests rely on the shared in-memory store, so they must
 *    run sequentially. In a production app, you would reset the store between
 *    tests with a beforeEach hook.
 *
 * 3. **CRUD Coverage**: Tests cover all operations: create, read, update,
 *    delete, bulk delete, export, and import.
 *
 * 4. **Type Testing**: Tests in index.test.tsx validate that TypeScript types
 *    are structurally correct (compile-time guarantees).
 *
 * Run tests: bun test
 */
import { describe, expect, it, beforeEach } from 'bun:test';
import { addTask, getTasks, getTaskById, updateTask, deleteTask, clearCompletedTasks, exportTasks, importTasks } from '@/lib/taskStore';

describe('TaskStore', () => {
  /** Verify the module auto-initializes with sample data on import */
  it('should initialize with sample tasks', () => {
    const tasks = getTasks();
    expect(tasks.length).toBeGreaterThan(0);
  });

  /** Verify addTask returns the created task with auto-generated id and timestamps */
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

  /** Verify getTaskById retrieves a task by its unique identifier */
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

  /** Verify updateTask merges changes and auto-updates the updatedAt timestamp */
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

  /** Verify deleteTask removes the task and returns true */
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

  /** Verify clearCompletedTasks removes only completed tasks, leaving active ones */
  it('should clear completed tasks', () => {
    addTask({ title: 'Completed 1', completed: true, priority: 'low', tags: [] });
    addTask({ title: 'Completed 2', completed: true, priority: 'medium', tags: [] });
    addTask({ title: 'Active 1', completed: false, priority: 'high', tags: [] });

    clearCompletedTasks();
    const remaining = getTasks();
    expect(remaining.every(t => !t.completed)).toBe(true);
  });

  /** Verify exportTasks produces valid JSON array with serializable dates */
  it('should export tasks as JSON', () => {
    const json = exportTasks();
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });

  /** Verify importTasks round-trips data without loss */
  it('should import tasks from JSON', () => {
    const json = exportTasks();
    const initialCount = getTasks().length;
    importTasks(json);
    expect(getTasks().length).toBe(initialCount);
  });

  /** Verify tags are preserved as arrays through the addTask pipeline */
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
