# Brisa Learning Guide

Изучайте фреймворк **Brisa** на примере этого проекта — Task Manager. Каждый раздел объясняет ключевой концепт и показывает, где его найти в коде.

---

## Содержание

1. [Что такое Brisa](#1-что-такое-brisa)
2. [Архитектура проекта](#2-архитектура-проекта)
3. [Серверные компоненты](#3-серверные-компоненты)
4. [Веб-компоненты (клиентские)](#4-веб-компоненты-клиентские)
5. [Реактивные сигналы — `state()`](#5-реактивные-сигналы--state)
6. [Серверное хранилище — `store`](#6-серверное-хранилище--store)
7. [Перерисовка — `rerenderInAction`](#7-перерисовка--rerenderinaction)
8. [Управление задачами (CRUD)](#8-управление-задачами-crud)
9. [Аутентификация](#9-аутентификация)
10. [Фильтрация и сортировка](#10-фильтрация-и-сортировка)
11. [Формы и валидация](#11-формы-и-валидация)
12. [Inline-редактирование](#12-inline-редактирование)
13. [Сохранение данных](#13-сохранение-данных)
14. [Тестирование](#14-тестирование)
15. [Сборка и деплой](#15-сборка-и-деплой)

---

## 1. Что такое Brisa

**Brisa** — это фреймворк для создания full-stack веб-приложений на TypeScript/JSX. Его ключевая идея:

> **Серверные компоненты рендерятся на сервере, а интерактивные части работают как веб-компоненты на клиенте.**

Это даёт:
- **Быструю загрузку** — HTML приходит с сервера готовым
- **Меньше JavaScript** — на клиент отправляется только интерактивная часть
- **TypeScript из коробки** — полная типизация

### Два типа компонентов

| Тип | Расположение | Состояние | Пример в проекте |
|-----|-------------|-----------|-----------------|
| **Server Component** | `src/components/`, `src/pages/` | `store` (серверное хранилище) | `task-list.tsx`, `task-form.tsx` |
| **Web Component** | `src/web-components/` | `state()` (клиентский сигнал) | `counter-client.tsx` |

---

## 2. Архитектура проекта

```
src/
├── layout/index.tsx          # Корневой макет (HTML, head, header, footer)
├── pages/
│   └── index.tsx             # Главная страница (аутентификация + TaskList)
├── components/               # Серверные компоненты
│   ├── task-list.tsx         # Центральный компонент: фильтры, CRUD, сортировка
│   ├── task-item.tsx         # Одна задача: просмотр + inline-редактирование
│   ├── task-form.tsx         # Форма добавления задачи
│   ├── task-filter-bar.tsx   # Панель фильтров и сортировки
│   ├── counter-server.tsx    # Серверный счётчик (демо store)
│   ├── navigation.tsx        # Навигация
│   └── footer.tsx            # Футер
├── web-components/           # Клиентские веб-компоненты
│   └── counter-client.tsx    # Клиентский счётчик (демо state)
├── lib/                      # Бизнес-логика
│   ├── taskModel.ts          # Типы и интерфейсы
│   ├── taskStore.ts          # CRUD-операции + server store интеграция
│   └── authStore.ts          # Аутентификация
└── styles/                   # CSS-стили
```

**Поток данных:**
```
User → Event → Handler → taskStore → setServerTasks → rerenderInAction → UI
```

---

## 3. Серверные компоненты

Серверный компонент — это функция, которая принимает два аргумента:

```tsx
// src/components/task-form.tsx
export default function TaskForm(
  { store }: RequestContext,  // ← Первый аргумент: серверный контекст
  { state }: WebContext,      // ← Второй аргумент: клиентские возможности
) {
  // ...
}
```

### `RequestContext`
Содержит:
- `store` — серверное хранилище (ключ-значение)
- `request` — объект HTTP-запроса
- `i18n` — интернационализация

### Как это работает
1. Сервер выполняет компонент и генерирует HTML
2. HTML отправляется клиенту
3. При интеракции (клик, ввод) Brisa отправляет запрос на сервер
4. Сервер перерисовывает компонент и возвращает обновлённый HTML

**См. в коде:** `src/components/task-list.tsx:9-12`

---

## 4. Веб-компоненты (клиентские)

Веб-компоненты работают **только в браузере**. Они получают только `WebContext`:

```tsx
// src/web-components/counter-client.tsx
export default function Counter(
  { initialValue = 0 }: { initialValue: number },
  { state }: WebContext,
) {
  const count = state(initialValue);

  return (
    <button onClick={() => count.value++}>+</button>
    <div>{count.value}</div>
  );
}
```

### Ключевое отличие от серверных компонентов

| Серверный компонент | Веб-компонент |
|---------------------|---------------|
| `store.set()` для изменения данных | `signal.value = x` для мгновенного обновления |
| Требует `rerenderInAction` для обновления UI | DOM обновляется автоматически |
| Данные разделяются между пользователями | Данные уникальны для каждого пользователя |
| Работает при отключённом JS (SSR) | Требует JavaScript |

**Сравните:** `src/components/counter-server.tsx` vs `src/web-components/counter-client.tsx`

---

## 5. Реактивные сигналы — `state()`

`state()` — это хук Brisa для создания реактивных сигналов на клиенте.

```tsx
const [value, setValue] = state('начальное значение');

// Чтение: value (или value.value в веб-компонентах)
// Запись: setValue('новое значение')
```

### Примеры из проекта

```tsx
// src/pages/index.tsx — состояние форм
const [username, setUsername] = state('');
const [showRegister, setShowRegister] = state(false);

// src/components/task-list.tsx — фильтры
const [searchTerm, setSearchTerm] = state<string>('');
const [sortBy, setSortBy] = state<TaskSortBy>('createdAt');
const [selectedTags, setSelectedTags] = state<string[]>([]);
```

### Как это работает под капотом

`state()` создаёт **сигнал** — реактивную обёртку вокруг значения. Когда сигнал меняется:
1. В серверных компонентах: Brisa планирует перерисовку
2. В веб-компонентах: DOM обновляется мгновенно через Proxy

**См. в коде:** `src/components/task-form.tsx:10-15`

---

## 6. Серверное хранилище — `store`

`store` — это key-value хранилище, привязанное к серверному контексту.

### Основные операции

```tsx
// Запись
store.set('tasks', tasksArray);

// Чтение
const tasks = store.get('tasks');

// Проверка наличия
if (!store.has('count')) store.set('count', 0);

// Передача на клиент
store.transferToClient(['tasks', 'auth']);
```

### Паттерн: get/set с transferToClient

Это основной паттерн синхронизации сервера и клиента:

```tsx
// src/lib/taskStore.ts:277-300
export function getServerTasks({ store }: RequestContext): Task[] {
  if (!store || typeof store.transferToClient !== 'function') {
    return Array.from(tasks.values()); // fallback для тестов
  }

  let storedTasks = store.get('tasks');
  if (!storedTasks) {
    initializeTasks();
    storedTasks = Array.from(tasks.values());
    store.set('tasks', storedTasks);
  }

  store.transferToClient(['tasks']); // ← Данные станут доступны клиенту
  return Array.from(tasks.values());
}
```

**Зачем `transferToClient`?** Без этого клиент не увидит данные из store при гидратации.

---

## 7. Перерисовка — `rerenderInAction`

После изменения данных серверный компонент нужно перерисовать:

```tsx
import { rerenderInAction } from 'brisa/server';

function handleToggleComplete(task: Task) {
  updateTask(task.id, { completed: !task.completed });
  setServerTasks({ store }, getTasks());

  rerenderInAction({ type: 'targetComponent' }); // ← Только этот компонент
}
```

### Типы перерисовки

- `{ type: 'targetComponent' }` — перерисовать только текущий компонент (эффективно)
- Другие типы зависят от версии Brisa

**Важно:** `rerenderInAction` работает только в серверных компонентах. В веб-компонентах DOM обновляется автоматически через сигналы.

**См. в коде:** `src/components/task-list.tsx:79-89`

---

## 8. Управление задачами (CRUD)

### Модель данных

```tsx
// src/lib/taskModel.ts:8-27
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];
}
```

### CRUD-операции

| Операция | Функция | Описание |
|----------|---------|----------|
| **Create** | `addTask()` | Авто-генерация ID, timestamps |
| **Read** | `getTasks()`, `getTaskById()` | Возвращают массив или одну задачу |
| **Update** | `updateTask(id, changes)` | Merge изменений, авто-обновление `updatedAt` |
| **Delete** | `deleteTask(id)` | Удаление по ID |
| **Clear** | `clearCompletedTasks()` | Массовое удаление выполненных |

### Хранение данных

В этом проекте данные хранятся **в памяти** (Map) + **localStorage** для клиентской персистентности. В реальном приложении вы бы использовали базу данных.

```tsx
// src/lib/taskStore.ts:6
let tasks: Map<string, Task> = new Map();
```

**Debounced localStorage:** Изменения сохраняются с задержкой 300мс, чтобы не писать в хранилище при каждом нажатии клавиши.

**См. в коде:** `src/lib/taskStore.ts:106-115`

---

## 9. Аутентификация

### Flow

```
┌─────────────┐     login()      ┌─────────────┐
│  Login Form │ ───────────────→ │  authStore  │
│  (index.tsx)│                  │             │
└─────────────┘                  │ setAuth()   │
                                 │ store.set()  │
                                 │ localStorage │
                                 └─────────────┘
                                         │
                                         ↓
                              ┌─────────────────────┐
                              │ getAuth() → redirect │
                              │   или показать UI    │
                              └─────────────────────┘
```

### Ключевые функции

```tsx
// src/lib/authStore.ts

login({ store }, username, password)   // → boolean
register({ store }, username, email, password)  // → boolean
logout({ store })                       // → void
getAuth({ store })                      // → { isAuthenticated, user }
setAuth({ store }, authState)           // → void
```

### Демо-учётные данные

```
Username: admin
Password: admin
```

### Что нужно для production

1. Хэширование паролей (bcrypt/argon2)
2. JWT или session tokens
3. HTTP-only cookies
4. CSRF-защита
5. Rate limiting на login
6. Email verification

**См. в коде:** `src/lib/authStore.ts` — все функции с JSDoc комментариями

---

## 10. Фильтрация и сортировка

### Фильтрация

Все фильтры применяются последовательно — задача должна пройти **все** проверки:

```tsx
// src/components/task-list.tsx:25-49
const filteredTasks = allTasks.filter(task => {
  const matchesCompletion = /* all / active / completed */;
  const matchesPriority = /* all / low / medium / high */;
  const matchesSearch =     /* поиск по title и description */;
  const matchesTags =       /* все выбранные теги присутствуют */;

  return matchesCompletion && matchesPriority && matchesSearch && matchesTags;
});
```

### Сортировка

```tsx
// src/components/task-list.tsx:52-77
const sortedTasks = [...filteredTasks].sort((a, b) => {
  // priority → числовое сравнение (high=3, medium=2, low=1)
  // dueDate → undefined = Infinity (всегда в конце)
  // createdAt → временная метка
  // title → localeCompare для корректной сортировки Unicode
});
```

### Tag Filter Chips

Теги отображаются как кнопки-чипы. Клик переключает тег:

```tsx
// src/components/task-filter-bar.tsx:63-79
onClick={() => {
  if (selectedTags.includes(tag)) {
    onTagsChange(selectedTags.filter(t => t !== tag)); // удалить
  } else {
    onTagsChange([...selectedTags, tag]); // добавить
  }
}}
```

**См. в коде:** `src/components/task-filter-bar.tsx`

---

## 11. Формы и валидация

### Controlled Inputs

Каждое поле формы управляется сигналом:

```tsx
// src/components/task-form.tsx
const [title, setTitle] = state('');

<input
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>
```

### Валидация при отправке

```tsx
const handleSubmit = (e: Event) => {
  e.preventDefault();
  if (!title.trim()) return; // ← Минимальная валидация

  // Парсинг и создание задачи...
};
```

### Валидация даты

```tsx
// src/components/task-item.tsx:40-43
if (editDueDate && isNaN(parsedDueDate.getTime())) {
  alert('Пожалуйста, введите корректную дату');
  return;
}
```

### Keyboard Shortcuts

| Клавиша | Контекст | Действие |
|---------|----------|----------|
| `Enter` | Поле заголовка | Отправить форму |
| `Enter` | Поле редактирования | Сохранить |
| `Escape` | Режим редактирования | Отменить |
| `Ctrl+Enter` | Textarea | Сохранить ( Enter = новая строка) |

**См. в коде:** `src/components/task-item.tsx:109-117`

---

## 12. Inline-редактирование

TaskItem переключается между режимом просмотра и редактирования:

### Переключение режима

```tsx
// Двойной клик по заголовку → режим редактирования
<h3 onDoubleClick={() => setIsEditing(true)}>{task.title}</h3>
```

### Состояние редактирования

При входе в режим редактирования поля инициализируются текущими значениями задачи:

```tsx
const [editTitle, setEditTitle] = state(task.title);
const [editDescription, setEditDescription] = state(task.description || '');
const [editPriority, setEditPriority] = state<Task['priority']>(task.priority);
```

### Отмена = сброс

При отмене все поля восстанавливаются из props:

```tsx
const handleCancel = () => {
  setIsEditing(false);
  setEditTitle(task.title); // ← Возврат к оригинальному значению
  // ...
};
```

**См. в коде:** `src/components/task-item.tsx:36-72`

---

## 13. Сохранение данных

### Уровни хранения

| Уровень | Механизм | Персистентность | Область |
|---------|----------|-----------------|---------|
| **Модуль** | `Map<string, Task>` | До перезапуска сервера | Все пользователи |
| **Brisa Store** | `store.set/get` | До перезапуска сервера | Все пользователи |
| **localStorage** | `localStorage.setItem` | Постоянно (браузер) | Один пользователь |

### Debounced Save

```tsx
// src/lib/taskStore.ts:106-115
function debouncedSaveToLocalStorage() {
  if (saveTimeout) clearTimeout(saveTimeout);

  saveTimeout = setTimeout(() => {
    saveToLocalStorage();
    saveTimeout = null;
  }, 300); // 300ms задержка
}
```

Зачем? Без debounce каждое изменение поля вызывало бы запись в localStorage, что медленно и избыточно.

### Before Unload

```tsx
// src/lib/taskStore.ts:324-330
window.addEventListener('beforeunload', () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveToLocalStorage(); // Сохранить немедленно при закрытии
  }
});
```

### Экспорт/Импорт

```tsx
exportTasks()   // → JSON string
importTasks(json) // ← Parse JSON, заменить все задачи
```

**См. в коде:** `src/lib/taskStore.ts:213-266`

---

## 14. Тестирование

Проект использует встроенный тестовый раннер Brisa (Bun test).

### Примеры тестов

```bash
bun test
```

Тесты проверяют:
- CRUD операции taskStore
- Рендеринг главной страницы
- Фильтрацию и сортировку

**См. в коде:** `src/lib/taskStore.test.ts`, `src/pages/index.test.tsx`

---

## 15. Сборка и деплой

### Разработка

```bash
bun run dev
```

### Сборка

```bash
bun run build:fix
```

> На Windows `build:fix` исправляет пути с обратными слешами (известная проблема Brisa 0.2.15)

### Production

```bash
bun run start
```

---

## Глоссарий

| Термин | Описание |
|--------|----------|
| **SSR** | Server-Side Rendering — генерация HTML на сервере |
| **Гидратация** | Процесс «оживления» серверного HTML клиентским JS |
| **Сигнал** | Реактивная обёртка вокруг значения (state) |
| **Store** | Серверное key-value хранилище |
| **RequestContext** | Контекст серверного запроса (store, request, i18n) |
| **WebContext** | Контекст клиента (state, signals) |
| **rerenderInAction** | Функция перерисовки серверного компонента |
| **Controlled Component** | Компонент, чьи данные полностью управляются извне |
| **Unidirectional Flow** | Данные теку вниз (props), события вверх (callbacks) |

---

## Схема взаимодействия компонентов

```
┌──────────────────────────────────────────────────────────────────┐
│                        LAYOUT (layout/index.tsx)                 │
│  ┌─────────┐  ┌─────────────────────────────────────────────┐   │
│  │  NAV    │  │                  MAIN                        │   │
│  │ (static)│  │  ┌───────────────────────────────────────┐  │   │
│  └─────────┘  │  │  HOMEPAGE (pages/index.tsx)          │  │   │
│               │  │                                       │  │   │
│               │  │  ┌─────────────┐    ┌──────────────┐  │  │   │
│               │  │  │ Login Form  │    │ TaskList     │  │  │   │
│               │  │  │ (not auth)  │    │ (auth)       │  │  │   │
│               │  │  └─────────────┘    └──────┬───────┘  │  │   │
│               │  │                            │          │  │   │
│               │  │              ┌─────────────┼───────┐  │  │   │
│               │  │              ▼             ▼       ▼  │  │   │
│               │  │         TaskForm    TaskFilterBar     │  │   │
│               │  │              │             │          │  │   │
│               │  │              ▼             ▼          │  │   │
│               │  │         ┌────────────────────────┐   │  │   │
│               │  │         │    TaskItem × N        │   │  │   │
│               │  │         │  (view / edit mode)    │   │  │   │
│               │  │         └────────────────────────┘   │  │   │
│               │  └───────────────────────────────────────┘  │   │
│               └─────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FOOTER (static)                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘

         ════ DATA LAYER (lib/) ════
         ┌──────────────┐  ┌──────────────┐
         │  taskStore   │  │  authStore   │
         │  (CRUD +     │  │  (login/     │
         │   store)     │  │   logout)    │
         └──────┬───────┘  └──────┬───────┘
                │                 │
                ▼                 ▼
         ┌──────────────┐  ┌──────────────┐
         │  taskModel   │  │  localStorage│
         │  (types)     │  │  (persist)   │
         └──────────────┘  └──────────────┘
```

---

## Пошаговый разбор: что происходит при клике "Добавить задачу"

```
Шаг 1: Пользователь вводит заголовок и нажимает "+"
         ↓
Шаг 2: Браузер отправляет событие onSubmit на сервер
         ↓
Шаг 3: handleSubmit() в task-form.tsx:
         - e.preventDefault() — отменяем стандартную отправку формы
         - Парсим теги: "работа, важное" → ["работа", "важное"]
         - Вызываем addTask() из taskStore
         ↓
Шаг 4: addTask() в taskStore.ts:
         - Генерирует ID: Math.random().toString(36).substr(2, 9)
         - Создаёт объект Task с createdAt = updatedAt = now
         - Сохраняет в Map: tasks.set(newTask.id, newTask)
         - Запускает debounced saveToLocalStorage()
         - Возвращает новый Task
         ↓
Шаг 5: setServerTasks({ store }, getTasks()) в task-form.tsx:
         - Обновляет серверный store: store.set('tasks', tasksArray)
         - transferToClient(['tasks']) — данные уходят на клиент
         ↓
Шаг 6: rerenderInAction({ type: 'targetComponent' }):
         - Brisa перерисовывает ТОЛЬКО TaskForm
         - Поля формы сбрасываются: setTitle(''), setDescription(''), ...
         - Обновлённый HTML отправляется клиенту
         ↓
Шаг 7: Клиент получает обновлённый HTML:
         - TaskList тоже перерисовывается (потому что store обновился)
         - Новая задача появляется в списке
```

---

## Типичные ошибки и как их избежать

### 1. Забытый `rerenderInAction`

```tsx
// НЕПРАВИЛЬНО — данные изменились, но UI не обновится
function handleDelete(id: string) {
  deleteTask(id);
  // Без rerenderInAction сервер не перерисовывает компонент
}

// ПРАВИЛЬНО
function handleDelete(id: string) {
  deleteTask(id);
  setServerTasks({ store }, getTasks());
  rerenderInAction({ type: 'targetComponent' });
}
```

### 2. Мутация store напрямую

```tsx
// НЕПРАВИЛЬНО — мутация нарушает реактивность
const tasks = getServerTasks({ store });
tasks[0].completed = true;

// ПРАВИЛЬНО — используйте updateTask
updateTask(tasks[0].id, { completed: true });
setServerTasks({ store }, getTasks());
```

### 3. Отсутствие `typeof window` проверки

```tsx
// НЕПРАВИЛЬНО — упадёт при SSR
localStorage.setItem('key', 'value');

// ПРАВИЛЬНО
if (typeof window !== 'undefined') {
  localStorage.setItem('key', 'value');
}
```

### 4. Мутация массива при сортировке

```tsx
// НЕПРАВИЛЬНО — sort() мутирует оригинальный массив
const sorted = allTasks.sort(...); // allTasks изменён!

// ПРАВИЛЬНО — создаём копию
const sorted = [...allTasks].sort(...); // allTasks не тронут
```

---

## Лучшие практики

### Организация компонентов

```
✅ Server Component (components/) — всё, что может рендериться на сервере
✅ Web Component (web-components/) — только интерактивные части с мгновенным откликом
✅ Lib (lib/) — бизнес-логика, типы, хранилища
✅ Pages (pages/) — точки входа, композиция компонентов
```

### Управление состоянием

```
✅ Используйте store для данных, общих между компонентами
✅ Используйте state() для UI-состояния конкретного компонента
✅ Не дублируйте данные — один источник истины
✅ Синхронизируйте store после каждой мутации
```

### Безопасность

```
✅ Валидируйте пользовательский ввод (title.trim(), date validation)
✅ Используйте rel="noreferrer" для внешних ссылок
✅ Не храните пароли в открытом виде (в production)
✅ Экранируйте XSS — Brisa экранирует JSX по умолчанию
```

---

## Упражнения для практики

### Начальный уровень
1. **Добавьте поле "категория"** в Task (например: "работа", "личное", "учёба")
2. **Добавьте фильтр по категории** в TaskFilterBar
3. **Измените цвет** приоритетов в task-item.tsx

### Средний уровень
4. **Добавьте подзадачи** — у каждой Task может быть список подзадач
5. **Реализуйте drag-and-drop** для изменения порядка задач
6. **Добавьте тёмную тему** с переключателем в навигации

### Продвинутый уровень
7. **Замените localStorage на IndexedDB** для хранения больших объёмов данных
8. **Добавьте WebSocket** для синхронизации задач между вкладками
9. **Реализуйте оффлайн-режим** с service worker

---

## Шпаргалка: API Brisa

| Функция | Импорт | Назначение |
|---------|--------|------------|
| `state(initialValue)` | `WebContext` | Создать реактивный сигнал |
| `store.get(key)` | `RequestContext` | Прочитать из серверного хранилища |
| `store.set(key, value)` | `RequestContext` | Записать в серверное хранилище |
| `store.has(key)` | `RequestContext` | Проверить наличие ключа |
| `store.transferToClient(keys)` | `RequestContext` | Передать данные клиенту |
| `rerenderInAction(options)` | `brisa/server` | Перерисовать серверный компонент |
| `brisaElement()` | `brisa/client` | Создать веб-компонент |

---

## Дальнейшее изучение

- [Документация Brisa](https://brisa.build)
- [Исходный код Brisa](https://github.com/brisa-build/brisa)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — безопасность веб-приложений
- [React Patterns](https://reactpatterns.com/) — многие паттерны применимы к Brisa
