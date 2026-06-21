import { useForm, FormRenderer, textField, selectField, required } from '@hnpsaga/makeform';
import type {
  PrimitiveFieldRendererProps,
  SelectRendererProps,
  FieldRendererProps,
  FieldRenderers,
  TextField,
  SelectField,
} from '@hnpsaga/makeform';

const textOnlySchema = {
  username: textField({
    label: 'Username',
    validators: [required()],
  }),
  bio: textField({
    label: 'Short Bio',
    validators: [required()],
  }),
};

const multiSchema = {
  product: textField({
    label: 'Product Name',
    validators: [required()],
  }),
  category: selectField({
    label: 'Category',
    validators: [required()],
    options: [
      { label: 'Electronics', value: 'electronics' },
      { label: 'Clothing', value: 'clothing' },
      { label: 'Books', value: 'books' },
      { label: 'Home & Garden', value: 'home' },
    ],
  }),
};

const fieldRenderersDemoSchema = {
  product: textField({
    label: 'Product Name',
    validators: [required()],
  }),
  category: selectField({
    label: 'Category',
    validators: [required()],
    options: [
      { label: 'Electronics', value: 'electronics' },
      { label: 'Clothing', value: 'clothing' },
    ],
  }),
};

function CustomTextRenderer({
  id,
  name,
  value,
  onChange,
  className,
}: PrimitiveFieldRendererProps<string>) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        style={{
          border: '2px solid #f59e0b',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          width: '100%',
          background: '#fffbeb',
          fontSize: '1rem',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#d97706';
          e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.2)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#f59e0b';
          e.target.style.boxShadow = 'none';
        }}
      />
      <span
        style={{
          position: 'absolute',
          right: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '0.75rem',
          color: '#d97706',
          fontStyle: 'italic',
        }}
      >
        {value.length} chars
      </span>
    </div>
  );
}

function StyledSelectRenderer({
  id,
  name,
  value,
  options,
  onChange,
  className,
}: SelectRendererProps) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      style={{
        border: '2px solid #10b981',
        borderRadius: '0.5rem',
        padding: '0.75rem 1rem',
        width: '100%',
        background: '#ecfdf5',
        fontSize: '1rem',
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 12 12%27%3E%3Cpath fill=%27%2310b981%27 d=%27M6 8L1 3h10z%27/%3E%3C/svg%3E")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        paddingRight: '2.5rem',
      }}
    >
      <option value="">Select a category</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

const styles = {
  badge: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.025em',
    marginLeft: '0.5rem',
    verticalAlign: 'middle' as const,
  },
  badgeBuiltIn: {
    background: '#e0e7ff',
    color: '#4338ca',
  },
  badgeRenderers: {
    background: '#fef3c7',
    color: '#92400e',
  },
  badgeFieldRenderers: {
    background: '#d1fae5',
    color: '#065f46',
  },
};

function Badge({ label, style }: { label: string; style: React.CSSProperties }) {
  return <span style={{ ...styles.badge, ...style }}>{label}</span>;
}

function ExampleDefault() {
  const form = useForm(textOnlySchema);
  return (
    <div>
      <h3>
        Example A: Default MakeForm
        <Badge label="builtInRenderers" style={styles.badgeBuiltIn} />
      </h3>
      <p>MakeForm renders fields using built-in renderers with default styling.</p>
      <FormRenderer form={form} schema={textOnlySchema} />
    </div>
  );
}

function ExampleCustom() {
  const form = useForm(textOnlySchema);
  return (
    <div>
      <h3>
        Example B: <code>renderers</code> — Input Replacement
        <Badge label="renderers" style={styles.badgeRenderers} />
      </h3>
      <p>
        A custom input with amber styling and live character count. MakeForm still owns the label,
        layout, and error display. The renderer only replaces the <strong>&lt;input&gt;</strong>{' '}
        element.
      </p>
      <p style={{ fontSize: '0.875rem', color: '#6366f1', fontStyle: 'italic' }}>
        Validation errors below are rendered by MakeForm.
      </p>
      <FormRenderer form={form} schema={textOnlySchema} renderers={{ text: CustomTextRenderer }} />
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => {
            form.markAllTouched();
            form.validate();
          }}
          style={{
            padding: '0.5rem 1.5rem',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Validate
        </button>
        <button
          onClick={() => form.reset()}
          style={{
            padding: '0.5rem 1.5rem',
            background: '#6b7280',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>
      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#f3f4f6',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          overflowX: 'auto',
        }}
      >
        <strong>State:</strong>{' '}
        <code style={{ wordBreak: 'break-word' }}>{JSON.stringify(form.getState().values)}</code>
      </div>
    </div>
  );
}

function ExampleMultiple() {
  const form = useForm(multiSchema);
  return (
    <div>
      <h3>
        Example C: <code>renderers</code> — Multiple Input Overrides
        <Badge label="renderers" style={styles.badgeRenderers} />
      </h3>
      <p>
        Replacing text and select inputs simultaneously. Each renderer only controls its input
        element — label and error rendering remain with MakeForm.
      </p>
      <p style={{ fontSize: '0.875rem', color: '#6366f1', fontStyle: 'italic' }}>
        Validation errors below are rendered by MakeForm.
      </p>
      <FormRenderer
        form={form}
        schema={multiSchema}
        renderers={{
          text: CustomTextRenderer,
          select: StyledSelectRenderer,
        }}
      />
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => {
            form.markAllTouched();
            form.validate();
          }}
          style={{
            padding: '0.5rem 1.5rem',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Validate
        </button>
        <button
          onClick={() => form.reset()}
          style={{
            padding: '0.5rem 1.5rem',
            background: '#6b7280',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>
      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#f3f4f6',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          overflowX: 'auto',
        }}
      >
        <strong>State:</strong>{' '}
        <code style={{ wordBreak: 'break-word' }}>{JSON.stringify(form.getState().values)}</code>
      </div>
    </div>
  );
}

function CustomFieldTextRenderer({ field, fieldState }: FieldRendererProps<string, TextField>) {
  return (
    <div style={{ padding: '1rem', background: '#eef2ff', borderRadius: '0.5rem' }}>
      <label
        style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#4338ca' }}
      >
        {field.label}
      </label>
      <input
        type="text"
        value={fieldState.value}
        onChange={(e) => fieldState.setValue(e.target.value)}
        style={{
          border: '2px solid #6366f1',
          borderRadius: '0.375rem',
          padding: '0.5rem 0.75rem',
          width: '100%',
          fontSize: '1rem',
        }}
      />
      {fieldState.touched && fieldState.errors.length > 0 && (
        <div style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }} role="alert">
          {fieldState.errors[0]}
        </div>
      )}
    </div>
  );
}

function CustomFieldSelectRenderer({ field, fieldState }: FieldRendererProps<string, SelectField>) {
  return (
    <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem' }}>
      <label
        style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#15803d' }}
      >
        {field.label}
      </label>
      <select
        value={fieldState.value}
        onChange={(e) => fieldState.setValue(e.target.value)}
        style={{
          border: '2px solid #22c55e',
          borderRadius: '0.375rem',
          padding: '0.5rem 0.75rem',
          width: '100%',
          fontSize: '1rem',
          background: '#fff',
        }}
      >
        <option value="">Select...</option>
        {field.options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {fieldState.touched && fieldState.errors.length > 0 && (
        <div style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }} role="alert">
          {fieldState.errors[0]}
        </div>
      )}
    </div>
  );
}

function ExampleFieldRenderers() {
  const form = useForm(fieldRenderersDemoSchema);

  const fieldRenderers: FieldRenderers = {
    text: CustomFieldTextRenderer,
    select: CustomFieldSelectRenderer,
  };

  return (
    <div>
      <h3>
        Example D: <code>fieldRenderers</code> — Complete Field Replacement
        <Badge label="fieldRenderers" style={styles.badgeFieldRenderers} />
      </h3>
      <p>
        The renderer owns the entire field presentation: label, input, error state, and layout.
        MakeForm provides the full field definition and state via <code>field</code> and{' '}
        <code>fieldState</code> props.
      </p>
      <p style={{ fontSize: '0.875rem', color: '#065f46', fontStyle: 'italic' }}>
        Validation errors below are rendered by the field renderer.
      </p>
      <FormRenderer form={form} schema={fieldRenderersDemoSchema} fieldRenderers={fieldRenderers} />
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => {
            form.markAllTouched();
            form.validate();
          }}
          style={{
            padding: '0.5rem 1.5rem',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Validate
        </button>
        <button
          onClick={() => form.reset()}
          style={{
            padding: '0.5rem 1.5rem',
            background: '#6b7280',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>
      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#f3f4f6',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          overflowX: 'auto',
        }}
      >
        <strong>State:</strong>{' '}
        <code style={{ wordBreak: 'break-word' }}>{JSON.stringify(form.getState().values)}</code>
      </div>
    </div>
  );
}

function ArchitectureGuide() {
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '0.5rem 0.75rem',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: 600,
  };

  const tdStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    borderBottom: '1px solid #e5e7eb',
  };

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.25rem',
        background: '#f9fafb',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
      }}
    >
      <h3 style={{ marginTop: 0 }}>Architecture Guide</h3>

      <h4>
        When to use <code>renderers</code>
      </h4>
      <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
        Use <strong>renderers</strong> when you only need to replace the input control. MakeForm
        continues to handle the label, error messages, and field layout. Ideal for rich text
        editors, date pickers, phone inputs, and specialized controls.
      </p>

      <h4>
        When to use <code>fieldRenderers</code>
      </h4>
      <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
        Use <strong>fieldRenderers</strong> when you need to own the entire field presentation —
        label, errors, layout, and input. This is the right choice for design system integration
        (Material UI, Chakra UI, Ant Design) and internal component libraries.
      </p>

      <h4>Extension Points</h4>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>API</th>
            <th style={thStyle}>Owns</th>
            <th style={thStyle}>Use Case</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}>
              <code>fieldRenderers</code>
            </td>
            <td style={tdStyle}>Label, errors, layout, input</td>
            <td style={tdStyle}>Design system integration</td>
          </tr>
          <tr>
            <td style={tdStyle}>
              <code>renderers</code>
            </td>
            <td style={tdStyle}>Input only</td>
            <td style={tdStyle}>Custom input controls</td>
          </tr>
          <tr>
            <td style={tdStyle}>
              <code>builtInRenderers</code>
            </td>
            <td style={tdStyle}>Everything</td>
            <td style={tdStyle}>Default MakeForm UI</td>
          </tr>
        </tbody>
      </table>

      <h4>Resolution Priority</h4>
      <pre
        style={{
          background: '#1f2937',
          color: '#e5e7eb',
          padding: '0.75rem',
          borderRadius: '0.375rem',
          fontSize: '0.8rem',
          overflow: 'auto',
        }}
      >
        {`fieldRenderers.text  ← checked first
        ↓
renderers.text       ← fallback
        ↓
builtInRenderers.text ← default`}
      </pre>
    </div>
  );
}

export default function Renderers() {
  return (
    <div>
      <h1>Renderer Overrides</h1>
      <p>
        MakeForm provides two extension points for customizing field rendering. Use{' '}
        <code>renderers</code> to replace just the input element, or <code>fieldRenderers</code> to
        take full control of the field presentation.
      </p>

      <section style={{ marginBottom: '2.5rem' }}>
        <ExampleDefault />
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <ExampleCustom />
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <ExampleMultiple />
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <ExampleFieldRenderers />
      </section>

      <section>
        <ArchitectureGuide />
      </section>
    </div>
  );
}
