import type { RequestContext } from 'brisa';

// Define the User type
export type User = {
  id: string;
  username: string;
};

// In-memory store for auth state
let isAuthenticated = false;
let user: User | null = null;

// Key for localStorage
const LOCAL_STORAGE_KEY = 'brisa-task-manager-auth';

// Initialize auth state from localStorage
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

// Save auth state to localStorage
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

export function getAuth({ store }: RequestContext): { isAuthenticated: boolean; user: User | null } {
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

export function setAuth({ store }: RequestContext, authState: { isAuthenticated: boolean; user: User | null }): void {
  isAuthenticated = authState.isAuthenticated;
  user = authState.user;
  store.set('auth', { isAuthenticated, user });
  store.transferToClient(['auth']);

  // Also save to localStorage
  saveAuthToLocalStorage();
}

export function login({ store }: RequestContext, username: string, password: string): boolean {
  // Simple hardcoded credentials for demo
  // In a real app, this would be an API call
  if (username === 'admin' && password === 'admin') {
    const user: User = {
      id: '1',
      username
    };
    setAuth({ store }, { isAuthenticated: true, user });
    return true;
  }
  return false;
}

export function logout({ store }: RequestContext): void {
  setAuth({ store }, { isAuthenticated: false, user: null });
}

// Cleanup function to save any changes before unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    saveAuthToLocalStorage();
  });
}