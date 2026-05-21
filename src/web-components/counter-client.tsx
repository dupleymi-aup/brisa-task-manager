/**
 * Counter — counter-client.tsx (Web Component)
 *
 * A client-side counter using Brisa's `state()` reactive signal.
 *
 * Key patterns demonstrated:
 *
 * 1. **Client-Side State**: The `count` signal lives entirely in the browser.
 *    Clicking buttons updates `count.value` directly — no server round-trip,
 *    no re-render needed. The DOM updates automatically via reactive binding.
 *
 * 2. **Web Components**: This file lives in `web-components/` directory,
 *    indicating it runs purely on the client. Compare with counter-server.tsx
 *    which lives in `components/` and uses the server store.
 *
 * 3. **Direct Signal Mutation**: Note `count.value++` — unlike server components
 *    where you call a setter function, client signals can be mutated directly
 *    because they are proxies that trigger DOM updates.
 *
 * Compare with counter-server.tsx to understand:
 * - Client signal: instant, no server load, not shared between users
 * - Server store: requires re-render, shared state, persists across requests
 */
import type { WebContext } from 'brisa';

export default function Counter(
  { initialValue = 0 }: { initialValue: number },
  { state }: WebContext,
) {
  const count = state(initialValue);

  return (
    <div class="counter">
      <div class="counter-container">
        <h2>Client counter</h2>
        <button class="increment-button" onClick={() => count.value++} aria-label="Increment">+</button>
        <div class="counter-value">{count.value}</div>
        <button class="decrement-button" onClick={() => count.value--} aria-label="Decrement">−</button>
      </div>
    </div>
  );
}
