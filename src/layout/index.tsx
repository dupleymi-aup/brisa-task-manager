/**
 * Layout — layout/index.tsx
 *
 * The root layout component that wraps every page in the application.
 *
 * Key patterns demonstrated:
 *
 * 1. **Layout Component**: Receives `children` as a prop and wraps them in
 *    a consistent HTML structure (header, main, footer). This is the
 *    "outlet" pattern — pages render inside <main> automatically.
 *
 * 2. **Global CSS Imports**: All stylesheet imports live here, ensuring every
 *    page has access to the same styles. CSS is scoped to the layout's
 *    import graph, not globally applied.
 *
 * 3. **SEO Meta Tags**: The <head> section includes essential meta tags:
 *    - <title>: Page title shown in browser tabs and search results
 *    - <meta name="theme-color">: Mobile browser toolbar color
 *    - <meta name="viewport">: Responsive design requirement
 *    - <link rel="shortcut icon">: Browser tab icon
 *
 * 4. **Font Preloading**: preconnect hints speed up Google Fonts loading
 *    by establishing early DNS/TLS connections.
 */
import Nav from '@/components/navigation';
import Footer from '@/components/footer';

import '@/styles/style.css';
import '@/styles/nav.css';
import '@/styles/footer.css';
import '@/styles/task.css';

export default function Layout({ children }: { children: JSX.Element }) {
  return (
    <html lang="ru">
      <head>
        <title id="title">Brisa</title>
        <meta name="theme-color" content="#ad1457" />
        <link rel="shortcut icon" href="/brisa.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <header>
          <Nav />
        </header>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
