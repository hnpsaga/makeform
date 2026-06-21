export default function Home() {
  return (
    <div>
      <h1>MakeForm Demo</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Introduction</h2>
        <p>
          MakeForm is a schema-driven form library for React with strong TypeScript type inference.
          This demo shows how to use MakeForm in a real application.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Demo Navigation</h2>
        <ul>
          <li>
            <strong>Registration</strong> — Registration form with text, email, password, and
            checkbox fields
          </li>
          <li>
            <strong>Profile</strong> — Profile form with text, textarea, phone, date, and select
            fields
          </li>
          <li>
            <strong>Validation</strong> — Validation showcase with required, min, max, pattern, and
            custom validators
          </li>
          <li>
            <strong>Features</strong> — Overview of MakeForm features
          </li>
          <li>
            <strong>Styling</strong> — Styling showcase with default theme, custom classNames, and
            utility-style customization
          </li>
          <li>
            <strong>Renderers</strong> — Demonstrates <code>renderers</code> (input replacement) and{' '}
            <code>fieldRenderers</code> (complete field replacement)
          </li>
          <li>
            <strong>Advanced</strong> — Specialized input controls (rich text editor, rating, tag
            selector) via <code>renderers</code>
          </li>
          <li>
            <strong>Material UI</strong> — Material UI integration via <code>fieldRenderers</code>
          </li>
        </ul>
      </section>

      <section>
        <h2>About MakeForm</h2>
        <p>
          MakeForm provides schema definition, type inference, validation, form state management,
          dynamic rendering, renderer overrides, custom renderers, and styling overrides — all from
          a single schema definition.
        </p>
        <p>
          Built by <a href="https://github.com/hnpsaga">Hari Naga Praveen Saga</a>.
        </p>
      </section>
    </div>
  );
}
