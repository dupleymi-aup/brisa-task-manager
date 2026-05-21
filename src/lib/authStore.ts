/**
 * Authentication Store — authStore.ts
 *
 * This module manages authentication state for the Brisa Task Manager.
 * It demonstrates several key Brisa patterns:
 *
 * 1. **Server Store + Client Sync**: The `getAuth` and `setAuth` functions
 *    use Brisa's RequestContext.store to persist auth state on the server
 *    and transferToClient() to make it available on the client side.
 *
 * 2. **localStorage Fallback**: For client-side persistence across page reloads,
 *    auth state is saved to localStorage. The `typeof window !== 'undefined'`
 *    check ensures this code only runs in the browser (not during SSR).
 *
 * 3. **Module-Level State**: The `isAuthenticated` and `user` variables live
 *    at module scope, meaning they persist across imports within the same
 *    runtime (server or client). This is a simple alternative to a global store.
 *
 * 4. **Demo Auth**: The `login` function uses hardcoded credentials (admin/admin).
 *    In a real app, you would call an API endpoint and verify a password hash.
 *
 * Key concepts to learn:
 * - RequestContext: Brisa's way of passing server-side context (store, request, etc.)
 * - store.get/set: Key-value storage that survives server-client boundaries
 * - store.transferToClient: Marks specific keys for client-side hydration
 */
import type { RequestContext } from 'brisa';

/**
 * User represents an authenticated user session.
 * Email is optional to support username-only accounts.
 */
export type User = {
  id: string;
  username: string;
  email?: string;
};

// ─── Module-level auth state ───────────────────────────────────────────────
// These variables hold the current authentication status in memory.
// They are shared by all imports of this module within the same runtime.
let isAuthenticated = false;
let user: User | null = null;

// Key for localStorage — used to persist auth across page reloads
const LOCAL_STORAGE_KEY = 'brisa-task-manager-auth';

/**
 * initializeAuth — Load authentication state from localStorage on startup.
 *
 * This function runs automatically when the module is first imported.
 * The `typeof window !== 'undefined'` guard is critical: it prevents
 * the code from running during server-side rendering (SSR), where
 * `window` and `localStorage` do not exist.
 *
 * Why parse JSON? localStorage only stores strings, so we serialize
 * the auth state to JSON when saving and parse it back when loading.
 */
function initializeAuth() {
  if (typeof window !== 'undefined') {
    try {
      const storedAuth = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        isAuthenticated = !!parsed.isAuthenticated;
        user = parsed.user ? { ...parsed.user } : null;
        return;
      }
    } catch (e) {
      console.warn('Failed to load auth from localStorage', e);
    }
  }

  // Default state: not authenticated
  isAuthenticated = false;
  user = null;
}

/**
 * saveAuthToLocalStorage — Persist current auth state to browser localStorage.
 *
 * Called after login, register, and logout to ensure the session survives
 * page reloads. The `typeof window` guard prevents SSR crashes.
 */
function saveAuthToLocalStorage() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        isAuthenticated,
        user
      }));
    } catch (e) {
      console.warn('Failed to save auth to localStorage', e);
    }
  }
}

// Initialize on module load
initializeAuth();

/**
 * getAuth — Retrieve current authentication state from the Brisa server store.
 *
 * This function demonstrates the server-store → client-sync pattern:
 * 1. If the store is unavailable (e.g., in tests), fall back to module-level state.
 * 2. If the store has existing data, use it to update our local variables.
 * 3. If the store is empty, seed it with the current module-level state.
 * 4. Call store.transferToClient(['auth']) so the client can read this data.
 *
 * @param context - Brisa RequestContext providing access to the server store
 * @returns Current { isAuthenticated, user } state
 */
export function getAuth({ store }: RequestContext): { isAuthenticated: boolean; user: User | null } {
  // Handle case when store is not available (e.g., in tests)
  if (!store || typeof store.transferToClient !== 'function') {
    return { isAuthenticated, user };
  }
  // Get auth from store, or initialize if not present
  let storedAuth = store.get('auth') as { isAuthenticated: boolean; user: User | null } | undefined;

  if (storedAuth) {
    isAuthenticated = storedAuth.isAuthenticated;
    user = storedAuth.user;
  } else {
    // Initialize with current state
    storedAuth = { isAuthenticated, user };
    store.set('auth', storedAuth);
  }

  // Transfer auth to client
  store.transferToClient(['auth']);

  return { isAuthenticated, user };
}

/**
 * setAuth — Update authentication state in both the server store and localStorage.
 *
 * This is the single source of truth for auth changes. Every login, register,
 * and logout call flows through here.
 *
 * @param context - Brisa RequestContext
 * @param authState - New authentication state to persist
 */
export function setAuth({ store }: RequestContext, authState: { isAuthenticated: boolean; user: User | null }): void {
  isAuthenticated = authState.isAuthenticated;
  user = authState.user;
  store.set('auth', { isAuthenticated, user });
  store.transferToClient(['auth']);

  // Also save to localStorage
  saveAuthToLocalStorage();
}

/**
 * login — Authenticate a user with username and password.
 *
 * This is a demo implementation using hardcoded credentials (admin/admin).
 * In a production app you would:
 * 1. Send credentials to an API endpoint via fetch()
 * 2. Verify the password hash on the server
 * 3. Return a session token or JWT
 * 4. Store the token in an HTTP-only cookie
 *
 * @param context - Brisa RequestContext
 * @param username - User's login name
 * @param password - User's password
 * @returns true if login succeeded, false otherwise
 */
export function login({ store }: RequestContext, username: string, password: string): boolean {
  // Simple hardcoded credentials for demo
  // In a real app, this would be an API call
  if (username === 'admin' && password === 'admin') {
    const user: User = {
      id: '1',
      username,
      email: 'admin@example.com'
    };
    setAuth({ store }, { isAuthenticated: true, user });
    return true;
  }
  return false;
}

/**
 * register — Create a new user account and log them in.
 *
 * Demo implementation: accepts any non-empty username/email/password.
 * In production you would:
 * - Validate email format
 * - Enforce password strength requirements
 * - Check for duplicate usernames in a database
 * - Hash the password with bcrypt/argon2 before storing
 * - Send a verification email
 *
 * @param context - Brisa RequestContext
 * @param username - Desired username
 * @param email - User's email address
 * @param password - Chosen password
 * @returns true if registration succeeded, false otherwise
 */
export function register({ store }: RequestContext, username: string, email: string, password: string): boolean {
  // Simple registration for demo
  // In a real app, this would validate input and call an API
  if (username.trim() !== '' && email.trim() !== '' && password.trim() !== '') {
    // Check if user already exists (in a real app, this would check against a database)
    // For demo, we'll just allow registration
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email
    };
    setAuth({ store }, { isAuthenticated: true, user });
    return true;
  }
  return false;
}

/**
 * logout — Clear the current user session.
 *
 * Resets both module-level state and server store, then persists
 * the cleared state to localStorage so the user stays logged out
 * after a page reload.
 *
 * @param context - Brisa RequestContext
 */
export function logout({ store }: RequestContext): void {
  setAuth({ store }, { isAuthenticated: false, user: null });
}

// Cleanup function to save any changes before unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    saveAuthToLocalStorage();
  });
}