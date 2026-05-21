/**
 * Navigation — navigation.tsx
 *
 * A simple static server component that renders the site navigation bar.
 *
 * Key patterns demonstrated:
 *
 * 1. **Pure Server Component**: This component takes no props and uses no state.
 *    It is purely presentational — the server renders it once to HTML and sends
 *    it to the client. No interactivity, no signals, no store access.
 *
 * 2. **External Links**: Uses target="_blank" with rel="noreferrer" for security.
 *    The noreferrer attribute prevents the new page from accessing window.opener
 *    and avoids leaking the referrer URL.
 *
 * 3. **File-Based Routing**: The href="/" and href="/about" links map directly
 *    to src/pages/index.tsx and src/pages/about/index.tsx. Brisa uses the
 *    filesystem as the router — no route configuration needed.
 */
export default function Nav() {
  return (
    <nav>
      <div class="nav-content">
        <a
          class="logo"
          href="https://brisa.build"
          target="_blank"
          rel="noreferrer"
        >
          <img src="/brisa.svg" alt="Brisa Framework logo" width="30" />
          Brisa
        </a>
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/about">About Brisa</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
