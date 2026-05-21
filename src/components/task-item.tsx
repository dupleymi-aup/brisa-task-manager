/**
 * TaskItem — task-item.tsx
 *
 * Renders a single task item with two modes: view and edit.
 *
 * Key patterns demonstrated:
 *
 * 1. **Presentation + Callback Pattern**: This component receives data via props
 *    (task object) and callbacks (onToggleComplete, onDelete, onUpdate). It does
 *    NOT mutate data directly — all changes flow through the parent's callbacks.
 *    This is a unidirectional data flow pattern common in React/Brisa.
 *
 * 2. **Inline Editing**: Double-clicking the title switches to edit mode. The
 *    component maintains its own local state for edit fields, initialized from
 *    the task props. Cancel resets all fields back to original values.
 *
 * 3. **Overdue Detection**: Compares task.dueDate with the current date to
 *    visually flag overdue tasks. This runs on every render so the UI stays
 *    accurate without manual refresh.
 *
 * 4. **Conditional CSS Classes**: Dynamic class names (`completed`, `overdue`,
 *    `due-today`) are applied based on task state, enabling CSS-driven visuals.
 *
 * 5. **Keyboard Shortcuts**: Enter to save, Escape to cancel, Ctrl+Enter for
 *    newlines in textarea.
 */
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
  // ─── Overdue / Due-Today Detection ─────────────────────────────────────────
  // isOverdue: due date has passed and task is not yet completed
  // isDueToday: due date falls on the current calendar day
  // These are recalculated on every render for accuracy.
  const isOverdue = !task.completed && task.dueDate && task.dueDate < new Date();

  const isDueToday = !task.completed && task.dueDate &&
    task.dueDate.toDateString() === new Date().toDateString();

  // ─── Edit State ────────────────────────────────────────────────────────────
  // Each editable field has its own signal. Values are initialized from the
  // task props. When the user cancels, these signals reset to original values.
  // Note: Date → string conversion for the date input (YYYY-MM-DD format).
  const [isEditing, setIsEditing] = state(false);
  const [editTitle, setEditTitle] = state(task.title);
  const [editDescription, setEditDescription] = state(task.description || '');
  const [editPriority, setEditPriority] = state<Task['priority']>(task.priority);
  const [editDueDate, setEditDueDate] = state<string>(task.dueDate ? task.dueDate.toISOString().split('T')[0] : '');
  const [editTags, setEditTags] = state<string>(task.tags.join(', '));

  // ─── Priority Color Map ───────────────────────────────────────────────────
  // Maps priority levels to hex colors for inline styling of priority tags.
  const priorityColors: Record<Task['priority'], string> = {
    low: '#27ae60',    // Green
    medium: '#f39c12', // Orange
    high: '#e74c3c'    // Red
  };

  /**
   * handleSave — Validate and submit edited task data.
   *
   * Parses the date string, validates it, constructs a new Task object,
   * and calls the parent's onUpdate callback. The actual persistence
   * happens in the parent (TaskList), keeping this component presentation-focused.
   */
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

  /**
   * handleCancel — Discard edits and restore original task values.
   *
   * Resets all edit signals back to the task's current prop values
   * and exits edit mode.
   */
  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ? task.dueDate.toISOString().split('T')[0] : '');
    setEditTags(task.tags.join(', '));
  };

  return (
    <li class={`task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${isDueToday ? 'due-today' : ''}`}>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSave();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleCancel();
                  }
                }}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSave();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleCancel();
                  }
                }}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSave();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleCancel();
                  }
                }}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSave();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleCancel();
                  }
                }}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSave();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleCancel();
                  }
                }}
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