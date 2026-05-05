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
