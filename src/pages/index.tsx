import type { RequestContext, WebContext } from 'brisa';
import { getAuth, login, logout, register } from '@/lib/authStore';
import TaskList from '@/components/task-list';

export default function Homepage({ store }: RequestContext, { state }: WebContext) {
  const { isAuthenticated, user } = getAuth({ store });

  // State for login form
  const [username, setUsername] = state('');
  const [password, setPassword] = state('');
  const [loginError, setLoginError] = state<string | null>(null);
  
  // State for register form
  const [regUsername, setRegUsername] = state('');
  const [regEmail, setRegEmail] = state('');
  const [regPassword, setRegPassword] = state('');
  const [registerError, setRegisterError] = state<string | null>(null);
  const [showRegister, setShowRegister] = state(false);

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

  const handleRegister = (e: Event) => {
    e.preventDefault();
    const success = register({ store }, regUsername, regEmail, regPassword);
    if (success) {
      setRegisterError(null);
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setShowRegister(false);
    } else {
      setRegisterError('Пожалуйста, заполните все поля');
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

        <div class="auth-container">
          {showRegister ? (
            <div class="register-container">
              <h2>Регистрация</h2>
              {registerError && <p class="register-error">{registerError}</p>}
              <form onSubmit={handleRegister}>
                <div class="form-group">
                  <label htmlFor="reg-username">Имя пользователя:</label>
                  <input
                    type="text"
                    id="reg-username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Введите имя пользователя"
                    required
                  />
                </div>
                <div class="form-group">
                  <label htmlFor="reg-email">Email:</label>
                  <input
                    type="email"
                    id="reg-email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Введите ваш email"
                    required
                  />
                </div>
                <div class="form-group">
                  <label htmlFor="reg-password">Пароль:</label>
                  <input
                    type="password"
                    id="reg-password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Введите пароль"
                    required
                  />
                </div>
                <button type="submit" class="submit-button">Зарегистрироваться</button>
                <button type="button" class="toggle-form" onClick={() => setShowRegister(false)}>
                  Уже есть аккаунт? Войти
                </button>
              </form>
            </div>
          ) : (
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
                <button type="button" class="toggle-form" onClick={() => setShowRegister(true)}>
                  Нет аккаунта? Зарегистрироваться
                </button>
              </form>
              <p class="login-info">
                Для демонстрации используйте:<br/>
                Имя пользователя: admin<br/>
                Пароль: admin
              </p>
            </div>
          )}
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
        <span>Пользователь: {user?.username} ({user?.email || 'без email'})</span>
        <button class="logout-button" onClick={() => logout({ store })}>
          Выход
        </button>
      </div>

      <section class="task-manager-section">
        <TaskForm />
        <TaskList />
      </section>
    </>
  );
}