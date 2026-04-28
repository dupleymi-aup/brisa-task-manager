import type { RequestContext, WebContext } from 'brisa';
import { getAuth, login, logout } from '@/lib/authStore';
import TaskList from '@/components/task-list';

export default function Homepage({ store }: RequestContext, { state }: WebContext) {
  const { isAuthenticated, user } = getAuth({ store });

  // State for login form
  const [username, setUsername] = state('');
  const [password, setPassword] = state('');
  const [loginError, setLoginError] = state<string | null>(null);

  const handleLogin = (e: Event) => {
    e.preventDefault();
    const success = login({ store }, username, password);
    if (success) {
      setLoginError(null);
      setUsername('');
      setPassword('');
    } else {
      setLoginError('Неверное имя пользователя или пароль');
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div class="hero">
          <h1>
            <span class="h1_addition">Brisa </span>Task Manager
          </h1>
          <p class="edit-note">✏️ Change this page on </p>
          <code>src/pages/index.tsx</code>
        </div>

        <div class="login-container">
          <h2>Вход в систему</h2>
          {loginError && <p class="login-error">{loginError}</p>}
          <form onSubmit={handleLogin}>
            <div class="form-group">
              <label htmlFor="login-username">Имя пользователя:</label>
              <input
                type="text"
                id="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите имя пользователя"
                required
              />
            </div>
            <div class="form-group">
              <label htmlFor="login-password">Пароль:</label>
              <input
                type="password"
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
              />
            </div>
            <button type="submit" class="submit-button">Войти</button>
          </form>
          <p class="login-info">
            Для демонстрации используйте:<br/>
            Имя пользователя: admin<br/>
            Пароль: admin
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div class="hero">
        <h1>
          <span class="h1_addition">Brisa </span>Task Manager
        </h1>
        <p class="edit-note">✏️ Change this page on </p>
        <code>src/pages/index.tsx</code>
      </div>

      <div class="user-info">
        <span>Пользователь: {user?.username}</span>
        <button class="logout-button" onClick={() => logout({ store })}>
          Выход
        </button>
      </div>

      <section class="task-manager-section">
        {/* TaskForm is temporarily disabled due to build issues */}
        <TaskList />
      </section>
    </>
  );
}