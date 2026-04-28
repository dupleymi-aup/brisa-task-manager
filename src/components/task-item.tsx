import type { WebContext } from 'brisa';
import { Task } from '@/lib/taskModel';

export default function TaskItem(
  { task, onToggleComplete, onDelete, onUpdate }: {
    task: Task;
    onToggleComplete: (task: Task) => void;
    onDelete: (id: string) => void;
    onUpdate: (updatedTask: Task) => void;
  },
  { state }: WebContext,
) {
  // Determine if task is overdue (due date passed and not completed)
  const isOverdue = !task.completed && task.dueDate && task.dueDate < new Date();

  // Editing state
  const [isEditing, setIsEditing] = state(false);
  const [editTitle, setEditTitle] = state(task.title);
  const [editDescription, setEditDescription] = state(task.description || '');
  const [editPriority, setEditPriority] = state<Task['priority']>(task.priority);
  const [editDueDate, setEditDueDate] = state<string>(task.dueDate ? task.dueDate.toISOString().split('T')[0] : '');
  const [editTags, setEditTags] = state<string>(task.tags.join(', '));

  // Priority colors
  const priorityColors: Record<Task['priority'], string> = {
    low: '#27ae60',    // Green
    medium: '#f39c12', // Orange
    high: '#e74c3c'    // Red
  };

  const handleSave = () => {
    // Parse dueDate if provided
    const parsedDueDate = editDueDate ? new Date(editDueDate) : undefined;
    
    // Validate date
    if (editDueDate && isNaN(parsedDueDate.getTime())) {
      alert('Пожалуйста, введите корректную дату');
      return;
    }

    const updatedTask: Task = {
      ...task,
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority,
      dueDate: parsedDueDate,
      tags: editTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    };

    // Only save if title is not empty
    if (updatedTask.title) {
      onUpdate(updatedTask);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ? task.dueDate.toISOString().split('T')[0] : '');
    setEditTags(task.tags.join(', '));
  };

  return (
    <li class={`task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
      <div class="task-content">
        {!isEditing ? (
          <>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete(task)}
            />
            <div class="task-details">
              <div class="task-header">
                <h3 class="task-title" onDoubleClick={() => setIsEditing(true)}>
                  {task.title}
                </h3>
                <div class="task-meta">
                  <span class="priority-tag" style={{ backgroundColor: priorityColors[task.priority] }}>
                    {task.priority === 'low' ? 'Низкий' : task.priority === 'medium' ? 'Средний' : 'Высокий'}
                  </span>
                  {task.dueDate && (
                    <span class="due-date">
                      Срок: {task.dueDate.toLocaleDateString()}{isOverdue ? ' (просрочено!)' : ''}
                    </span>
                  )}
                </div>
              </div>
              {task.description && <p class="task-description">{task.description}</p>}
            </div>
          </>
        ) : (
          <div class="task-edit">
            <div class="task-header">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Введите заголовок задачи..."
                class="edit-input"
                autoFocus
              />
            </div>
            
            <div class="form-group">
              <label htmlFor="edit-description">Описание:</label>
              <textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Введите описание задачи..."
                rows={3}
                class="edit-description"
              />
            </div>
            
            <div class="form-group">
              <label htmlFor="edit-priority">Приоритет:</label>
              <select
                id="edit-priority"
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Task['priority'])}
                class="edit-select"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>
            
            <div class="form-group">
              <label htmlFor="edit-due-date">Срок выполнения:</label>
              <input
                type="date"
                id="edit-due-date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                class="edit-input"
              />
            </div>
            
            <div class="form-group">
              <label htmlFor="edit-tags">Теги (через запятую):</label>
              <input
                type="text"
                id="edit-tags"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="например: работа, важное, встреча"
                class="edit-input"
              />
            </div>
            
            <div class="task-edit-actions">
              <button class="save-button" onClick={handleSave}>
                Сохранить
              </button>
              <button class="cancel-button" onClick={handleCancel}>
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
      <div class="task-actions">
        {!isEditing && (
          <button class="delete-button" onClick={() => {
            if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
              onDelete(task.id);
            }
          }}>
            Удалить
          </button>
        )}
      </div>
    </li>
  );
}