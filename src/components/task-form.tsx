import type { RequestContext, WebContext } from 'brisa';
import { Task } from '@/lib/taskModel';
import { addTask, getTasks, setServerTasks } from '@/lib/taskStore';

export default function TaskForm({ store }: RequestContext, { state }: WebContext) {
  const [title, setTitle] = state('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const titleValue = title.trim();
    if (!titleValue) return;

    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: titleValue,
      description: '',
      completed: false,
      priority: 'medium' as const,
      dueDate: undefined,
      tags: []
    };

    // Add the task to the in-memory map (and schedule localStorage save)
    addTask(taskData);

    // Get the updated tasks from the in-memory map
    const allTasks = getTasks();
    // Update the Brisa store with the updated tasks to trigger transfer to client
    setServerTasks({ store }, allTasks);

    // Reset the input
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Введите заголовок задачи..."
        />
      </div>
      <button type="submit">Добавить задачу</button>
    </form>
  );
}