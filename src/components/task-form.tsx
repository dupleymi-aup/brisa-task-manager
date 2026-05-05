import type { RequestContext, WebContext } from 'brisa';
import { rerenderInAction } from 'brisa/server';
import { addTask, getServerTasks, setServerTasks } from '@/lib/taskStore';
import { Task } from '@/lib/taskModel';

export default function TaskForm(
  { store }: RequestContext,
  { state }: WebContext,
) {
  const [title, setTitle] = state('');
  const [description, setDescription] = state('');
  const [priority, setPriority] = state<Task['priority']>('medium');
  const [dueDate, setDueDate] = state('');
  const [tags, setTags] = state('');
  const [showDetails, setShowDetails] = state(false);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedDueDate = dueDate ? new Date(dueDate) : undefined;
    const parsedTags = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const allTasks = getServerTasks({ store });

    const newTask = addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      dueDate: parsedDueDate,
      tags: parsedTags,
    });

    setServerTasks({ store }, [...allTasks, newTask]);

    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setTags('');
    setShowDetails(false);

    rerenderInAction({ type: 'targetComponent' });
  };

  const handleTitleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form class="task-form" onSubmit={handleSubmit}>
      <div class="task-form-main">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder="Добавить новую задачу..."
          class="task-form-title-input"
          required
        />
        <button
          type="button"
          class="task-form-toggle"
          onClick={() => setShowDetails(!showDetails)}
          title={showDetails ? 'Скрыть детали' : 'Показать детали'}
        >
          {showDetails ? '△' : '▽'}
        </button>
        <button
          type="submit"
          class="task-form-submit"
          disabled={!title.trim()}
          title="Добавить задачу"
        >
          +
        </button>
      </div>

      {showDetails && (
        <div class="task-form-details">
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
          <div class="task-form-row">
            <div class="form-group">
              <label htmlFor="task-priority">Приоритет:</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
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
        </div>
      )}
    </form>
  );
}
