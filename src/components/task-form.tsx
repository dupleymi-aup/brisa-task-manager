import type { RequestContext, WebContext } from 'brisa';
import { Task } from '@/lib/taskModel';
import { addTask, getTasks, setServerTasks } from '@/lib/taskStore';

export default function TaskForm({ store }: RequestContext, { state }: WebContext) {
  const [title, setTitle] = state('');
  const [description, setDescription] = state('');
  const [priority, setPriority] = state<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = state<string>('');
  const [tags, setTags] = state<string[]>('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const titleValue = title.trim();
    if (!titleValue) return;

    // Parse dueDate if provided
    const parsedDueDate = dueDate ? new Date(dueDate) : undefined;
    
    // Validate date
    if (dueDate && isNaN(parsedDueDate.getTime())) {
      alert('Пожалуйста, введите корректную дату');
      return;
    }

    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: titleValue,
      description: description.trim(),
      completed: false,
      priority,
      dueDate: parsedDueDate,
      tags: tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    };

    // Add the task to the in-memory map (and schedule localStorage save)
    addTask(taskData);

    // Get the updated tasks from the in-memory map
    const allTasks = getTasks();
    // Update the Brisa store with the updated tasks to trigger transfer to client
    setServerTasks({ store }, allTasks);

    // Reset the form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setTags('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div class="form-group">
        <label htmlFor="task-title">Заголовок:</label>
        <input
          type="text"
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Введите заголовок задачи..."
          required
        />
      </div>
      
      <div class="form-group">
        <label htmlFor="task-description">Описание:</label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Введите описание задачи..."
          rows={3}
        />
      </div>
      
      <div class="form-group">
        <label htmlFor="task-priority">Приоритет:</label>
        <select
          id="task-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
        >
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
      </div>
      
      <div class="form-group">
        <label htmlFor="task-due-date">Срок выполнения:</label>
        <input
          type="date"
          id="task-due-date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      
      <div class="form-group">
        <label htmlFor="task-tags">Теги (через запятую):</label>
        <input
          type="text"
          id="task-tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="например: работа, важное, встреча"
        />
      </div>
      
      <button type="submit" class="submit-button">Добавить задачу</button>
    </form>
  );
}