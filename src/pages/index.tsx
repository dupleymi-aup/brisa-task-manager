import TaskForm from '@/components/task-form';
import TaskList from '@/components/task-list';

export default function Homepage() {
  return (
    <>
      <div class="hero">
        <h1>
          <span class="h1_addition">Brisa </span>Task Manager
        </h1>
        <p class="edit-note">✏️ Change this page on </p>
        <code>src/pages/index.tsx</code>
      </div>

      <section class="task-manager-section">
        <TaskForm />
        <TaskList />
      </section>
    </>
  );
}