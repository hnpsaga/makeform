import {
  useForm,
  FormRenderer,
  textField,
  selectField,
  checkboxField,
  customField,
  required,
} from '@hnpsaga/makeform';
import type {
  PrimitiveFieldRendererProps,
  SelectRendererProps,
  FieldRendererProps,
  FieldRenderers,
} from '@hnpsaga/makeform';
import type { TextField, SelectField } from '@hnpsaga/makeform';

const textOnlySchema = {
  username: textField({
    label: 'Username',
  }),
  bio: textField({
    label: 'Short Bio',
  }),
};

const multiSchema = {
  product: textField({
    label: 'Product Name',
  }),
  category: selectField({
    label: 'Category',
    options: [
      { label: 'Electronics', value: 'electronics' },
      { label: 'Clothing', value: 'clothing' },
      { label: 'Books', value: 'books' },
      { label: 'Home & Garden', value: 'home' },
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

function ExampleDefault() {
  const form = useForm(textOnlySchema);
  return (
    <div>
      <h3>Example A: Default Text Renderer</h3>
      <p>Built-in MakeForm text renderer with default styling.</p>
      <FormRenderer form={form} schema={textOnlySchema} />
    </div>
  );
}

function ExampleCustom() {
  const form = useForm(textOnlySchema);
  return (
    <div>
      <h3>Example B: Custom Text Renderer</h3>
      <p>
        A custom text renderer with amber styling and live character count. Connected to MakeForm
        state through the renderer override system.
      </p>
      <FormRenderer form={form} schema={textOnlySchema} renderers={{ text: CustomTextRenderer }} />
      <div style={{ marginTop: '1rem' }}>
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
        }}
      >
        <strong>State:</strong> <code>{JSON.stringify(form.getState().values)}</code>
      </div>
    </div>
  );
}

function ExampleMultiple() {
  const form = useForm(multiSchema);
  return (
    <div>
      <h3>Example C: Multiple Renderer Overrides</h3>
      <p>
        Partially overriding text and select renderers simultaneously. Other field types would use
        their default renderers.
      </p>
      <FormRenderer
        form={form}
        schema={multiSchema}
        renderers={{
          text: CustomTextRenderer,
          select: StyledSelectRenderer,
        }}
      />
      <div style={{ marginTop: '1rem' }}>
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
        }}
      >
        <strong>State:</strong> <code>{JSON.stringify(form.getState().values)}</code>
      </div>
    </div>
  );
}

function CustomFieldTextRenderer({
  id,
  name,
  field,
  fieldState,
}: FieldRendererProps<string, TextField>) {
  return (
    <div style={{ padding: '1rem', background: '#eef2ff', borderRadius: '0.5rem' }}>
      <label
        htmlFor={id}
        style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#4338ca' }}
      >
        {field.label}
      </label>
      <input
        id={id}
        name={name}
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

function CustomFieldSelectRenderer({
  id,
  name,
  field,
  fieldState,
}: FieldRendererProps<string, SelectField>) {
  return (
    <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem' }}>
      <label
        htmlFor={id}
        style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#15803d' }}
      >
        {field.label}
      </label>
      <select
        id={id}
        name={name}
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
    </div>
  );
}

const fieldRenderersDemoSchema = {
  product: textField({
    label: 'Product Name',
    validators: [required()],
  }),
  category: selectField({
    label: 'Category',
    options: [
      { label: 'Electronics', value: 'electronics' },
      { label: 'Clothing', value: 'clothing' },
    ],
  }),
};

function ExampleFieldRenderers() {
  const form = useForm(fieldRenderersDemoSchema);

  const fieldRenderers: FieldRenderers = {
    text: CustomFieldTextRenderer,
    select: CustomFieldSelectRenderer,
  };

  return (
    <div>
      <h3>Example D: Field Renderer Overrides</h3>
      <p>
        Complete field-level overrides using the <code>fieldRenderers</code> prop. Each field
        renderer owns its label, input, and error rendering — MakeForm provides full field context
        via <code>fieldState</code> and <code>field</code>.
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
        }}
      >
        <strong>State:</strong> <code>{JSON.stringify(form.getState().values)}</code>
      </div>
    </div>
  );
}

export default function Renderers() {
  return (
    <div>
      <h1>Renderer Overrides</h1>
      <p>
        MakeForm lets you replace any built-in field renderer via the <code>renderers</code> prop on{' '}
        <code>FormRenderer</code>. This is useful for integrating with design systems, component
        libraries, or custom UI requirements.
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
    </div>
  );
}
