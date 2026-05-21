/**
 * CounterServer — counter-server.tsx
 *
 * A server-side counter that persists its value in the Brisa server store.
 *
 * Key patterns demonstrated:
 *
 * 1. **Server Store as State**: Unlike the client counter (which uses `state()`),
 *    this component stores its value in `store.get/set`. The value survives
 *    across server re-renders but is shared across all users (since it's a
 *    demo — in production you'd scope state to a session or user).
 *
 * 2. **store.transferToClient**: Makes the `count` key available on the client
 *    so the rendered value is hydrated correctly.
 *
 * 3. **rerenderInAction**: After incrementing/decrementing, this function
 *    triggers a server re-render of ONLY this component (targetComponent),
 *    not the entire page. This is efficient for partial updates.
 *
 * Compare with counter-client.tsx to understand the difference between
 * server-store state and client-side reactive signals.
 */
import type { RequestContext } from 'brisa';
import { rerenderInAction } from 'brisa/server';

export default function CounterServer(
  { initialValue = 0 }: { initialValue: number },
  { store }: RequestContext,
) {
  if (!store.has('count')) store.set('count', initialValue);
  store.transferToClient(['count']);

  function increment() {
    store.set('count', store.get('count') + 1);
    rerenderInAction({ type: 'targetComponent' });
  }

  function decrement() {
    store.set('count', store.get('count') - 1);
    rerenderInAction({ type: 'targetComponent' });
  }

  return (
    <div class="counter">
      <div class="counter-container">
        <h2>Server counter</h2>
        <button class="increment-button" onClick={increment} aria-label="Increment">+</button>
        <div class="counter-value">{store.get('count')}</div>
        <button class="decrement-button" onClick={decrement} aria-label="Decrement">−</button>
      </div>
    </div>
  );
}
