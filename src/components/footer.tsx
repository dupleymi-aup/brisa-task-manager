/**
 * Footer — footer.tsx
 *
 * Static footer component rendered on every page via the Layout.
 *
 * Key patterns demonstrated:
 *
 * 1. **Data-Replacement Animation**: The data-replace="GitHub" attribute is
 *    used by the CSS to create a hover animation that replaces the link text.
 *    This is a progressive enhancement — it works without JavaScript.
 *
 * 2. **Shared Components**: Footer is imported once in Layout and appears
 *    across all pages. This is the DRY (Don't Repeat Yourself) principle
 *    applied to UI layout.
 */
export default function Footer() {
  return (
    <footer>
      <p>
        View on{' '}
        <a
          class="CTA"
          href="https://github.com/brisa-build/brisa"
          id="github-link"
          target="_blank"
          data-replace="GitHub"
          rel="noreferrer"
        >
          <span>GitHub</span>
        </a>
      </p>
    </footer>
  );
}
