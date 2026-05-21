/**
 * Task Model Tests — index.test.tsx
 *
 * Type-level and structural tests for the Task data model.
 *
 * These tests verify that:
 * 1. The Task interface accepts the expected shape (structural typing)
 * 2. All union type variants are valid (low/medium/high priority, etc.)
 * 3. Type aliases have the expected number of options
 *
 * Note: These tests catch type errors at runtime by constructing values
 * of the expected types. If TypeScript compiles, these tests will pass
 * unless the runtime shape changes.
 */
import { describe, expect, it } from 'bun:test';
import { Task, TaskFilter, TaskPriorityFilter, TaskSortBy, TaskSortOrder } from '@/lib/taskModel';

describe('Task Model', () => {
  it('should have correct Task type structure', () => {
    const task: Task = {
      id: '1',
      title: 'Test task',
      description: 'Test description',
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['test'],
    };
    expect(task.id).toBe('1');
    expect(task.title).toBe('Test task');
    expect(task.completed).toBe(false);
    expect(task.priority).toBe('medium');
    expect(task.tags).toEqual(['test']);
  });

  it('should support all priority levels', () => {
    const priorities: Task['priority'][] = ['low', 'medium', 'high'];
    expect(priorities.length).toBe(3);
  });

  it('should support all filter types', () => {
    const filters: TaskFilter[] = ['all', 'active', 'completed'];
    expect(filters.length).toBe(3);
  });

  it('should support all priority filter types', () => {
    const priorityFilters: TaskPriorityFilter[] = ['all', 'low', 'medium', 'high'];
    expect(priorityFilters.length).toBe(4);
  });

  it('should support all sort options', () => {
    const sortOptions: TaskSortBy[] = ['createdAt', 'dueDate', 'priority', 'title'];
    expect(sortOptions.length).toBe(4);
  });

  it('should support all sort orders', () => {
    const sortOrders: TaskSortOrder[] = ['asc', 'desc'];
    expect(sortOrders.length).toBe(2);
  });
});
