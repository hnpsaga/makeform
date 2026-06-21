# MakeForm

Schema-driven TypeScript forms for React.

Build forms with strong type inference, validation, state management, dynamic rendering, and extensible UI customization — all from a single schema.

Most form libraries force you to choose between strong typing, dynamic form generation, and flexible UI customization. MakeForm provides all three. Define your form once and get:

- Strong TypeScript inference
- Built-in validation
- Form state management
- Dynamic form rendering
- React integration
- Renderer overrides
- Custom field support
- Styling overrides
- Framework-agnostic core engine

---

## Live Demo

Try MakeForm in action:

https://makeform-demo.vercel.app/

---

## Features

### Strong Type Inference

```ts
const schema = {
  name: textField(),
  age: numberField(),
  subscribed: checkboxField(),
};

type FormValues = InferValues<typeof schema>;

/*
{
  name: string;
  age: number;
  subscribed: boolean;
}
*/
```

### Schema-Driven Forms

Define your form structure in one place.

```ts
const schema = {
  name: textField({
    label: 'Full Name',
    validators: [required()],
  }),

  email: emailField({
    label: 'Email Address',
    validators: [required(), email()],
  }),

  age: numberField({
    label: 'Age',
    validators: [min(18)],
  }),
};
```

### Dynamic Form Rendering

Render complete forms directly from a schema.

```tsx
<FormRenderer form={form} schema={schema} />
```

### Extensible UI

Replace any built-in field renderer.

```tsx
<FormRenderer
  form={form}
  schema={schema}
  renderers={{
    text: CustomTextRenderer,
  }}
/>
```

Or create entirely new field experiences.

```tsx
<FormRenderer
  form={form}
  schema={schema}
  renderers={{
    custom: {
      richText: RichTextRenderer,
    },
  }}
/>
```

### Styling Overrides

Keep the default theme or integrate with your own design system.

```tsx
<FormRenderer
  form={form}
  schema={schema}
  classNames={{
    input: 'my-input',
    field: 'my-field',
    error: 'my-error',
  }}
/>
```

---

## Installation

```bash
npm install @hnpsaga/makeform
```

Peer dependency:

```bash
npm install react
```

Supports:

- React 18
- React 19

---

## Quick Start

```tsx
import { useForm, FormRenderer, textField, emailField, required, email } from '@hnpsaga/makeform';

const schema = {
  name: textField({
    label: 'Name',
    validators: [required()],
  }),

  email: emailField({
    label: 'Email',
    validators: [required(), email()],
  }),
};

export default function App() {
  const form = useForm(schema);

  const submit = form.handleSubmit((values) => {
    console.log(values);
  });

  return (
    <>
      <FormRenderer form={form} schema={schema} />

      <button onClick={submit}>Submit</button>
    </>
  );
}
```

---

## Core Concepts

### 1. Schema Definition

Schemas define field types, labels, default values, validation rules, and rendering metadata.

```ts
const schema = {
  firstName: textField({
    label: 'First Name',
    validators: [required()],
  }),

  age: numberField({
    label: 'Age',
    validators: [min(18)],
  }),
};
```

### 2. Type Inference

Generate form value types automatically — no manual interfaces required.

```ts
type FormValues = InferValues<typeof schema>;
```

### 3. Validation

Attach validators directly to fields.

```ts
const schema = {
  password: passwordField({
    validators: [required(), min(8)],
  }),
};
```

Validate manually:

```ts
const result = form.validate();

if (!result.valid) {
  console.log(result.errors);
}
```

Built-in validators:

```ts
required();
min();
max();
pattern();
email();
phone();
custom();
```

### 4. Form Submission

MakeForm includes a submission helper.

```ts
const submit = form.handleSubmit((values) => {
  console.log(values);
});

submit();
```

`handleSubmit()`:

1. Marks all fields as touched
2. Runs validation
3. Prevents invalid submission
4. Returns strongly typed values

---

## API Overview

### Form State Engine

The core engine is framework agnostic.

```ts
import { createForm } from '@hnpsaga/makeform';

const form = createForm(schema);
```

Available APIs:

```ts
form.getValues();
form.getValue('name');

form.setValue('name', 'John');

form.validate();

form.reset();

form.markAllTouched();

form.handleSubmit(callback);

form.subscribe(listener);
```

### React Integration

#### useForm

Creates and manages a form instance bound to React's rendering cycle.

```tsx
const form = useForm(schema);
```

#### useField

Subscribe to a single field. Only re-renders when that field changes.

```tsx
const name = useField(form, 'name');
```

Returns:

```ts
{
  value,
  errors,
  touched,
  dirty,
  setValue,
}
```

### Dynamic Form Rendering

#### FormRenderer

Automatically renders a complete form.

```tsx
<FormRenderer form={form} schema={schema} />
```

Supported field types:

| Field            |
| ---------------- |
| textField        |
| textareaField    |
| emailField       |
| phoneField       |
| passwordField    |
| numberField      |
| dateField        |
| checkboxField    |
| radioField       |
| selectField      |
| multiSelectField |
| customField      |

### Renderer Overrides

Replace built-in field renderers with your own components.

```tsx
<FormRenderer
  form={form}
  schema={schema}
  renderers={{
    text: CustomTextRenderer,
    email: CustomEmailRenderer,
  }}
/>
```

Useful for:

- Design systems
- Component libraries
- Internal UI standards

### Custom Renderers

Integrate third-party components such as rich text editors, date pickers, phone pickers, file uploads, typeahead inputs, and location pickers.

Schema:

```ts
const schema = {
  bio: customField<string>({
    component: 'richText',
  }),
};
```

Renderer:

```tsx
<FormRenderer
  form={form}
  schema={schema}
  renderers={{
    custom: {
      richText: RichTextRenderer,
    },
  }}
/>
```

Custom renderers automatically participate in validation, state updates, dirty tracking, touched tracking, reset, and submission.

### Field Renderer Overrides

Complete field-level overrides that replace the entire field presentation — label, error, layout, and input.

```tsx
import type { FieldRendererProps, FieldRenderers, TextField } from '@hnpsaga/makeform';

function MuiTextRenderer({ id, field, fieldState }: FieldRendererProps<string, TextField>) {
  return (
    <TextField
      id={id}
      label={field.label}
      value={fieldState.value}
      onChange={(e) => fieldState.setValue(e.target.value)}
      error={fieldState.touched && fieldState.errors.length > 0}
      helperText={fieldState.touched ? fieldState.errors[0] : undefined}
      fullWidth
    />
  );
}

<FormRenderer
  form={form}
  schema={schema}
  fieldRenderers={{
    text: MuiTextRenderer,
  }}
/>;
```

#### Resolution Priority

```
fieldRenderers.text
        ↓
renderers.text
        ↓
builtInRenderers.text
```

#### When to Use

| Extension Point  | Controls            | Use Case                  |
| ---------------- | ------------------- | ------------------------- |
| `fieldRenderers` | Label, error, input | Design system integration |
| `renderers`      | Input only          | Custom input controls     |
| Built-in         | Everything          | Default MakeForm UI       |

### Default Theme

MakeForm ships with a clean default theme.

```ts
import '@hnpsaga/makeform/dist/styles/default.css';
```

Includes responsive layout, labels, inputs, selects, textareas, checkboxes, radio groups, and error states.

### Styling Overrides

Customize styling without replacing renderers.

```tsx
<FormRenderer
  form={form}
  schema={schema}
  classNames={{
    form: 'my-form',
    grid: 'my-grid',
    field: 'my-field',
    label: 'my-label',
    input: 'my-input',
    error: 'my-error',
  }}
/>
```

Default styles remain active. Custom classes are appended.

### Architecture

MakeForm consists of five layers:

```
Schema System
      ↓
Type Inference
      ↓
Validation Engine
      ↓
Form State Engine
      ↓
React Rendering Layer
```

The form engine itself is framework agnostic. React integration is intentionally thin.

---

## Status

Current Release: v0.1.0

This project is actively maintained and available on [npm](https://www.npmjs.com/package/@hnpsaga/makeform).

---

## Development

A demo application is available in `apps/demo/` demonstrating schema definition, validation, form state, submission, and dynamic rendering.

### Running the Demo

```bash
# Build the library first
npm run build

# Navigate to the demo app
cd apps/demo

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### Demo Pages

- **Home** — Introduction and navigation
- **Registration** — Registration form with text, email, password, and checkbox fields
- **Profile** — Profile form with text, textarea, phone, date, and select fields
- **Validation** — Validation showcase with required, min, max, pattern, and custom validators
- **Features** — Overview of MakeForm features
- **Styling** — Styling showcase with default theme, custom classNames, and utility-style customization
- **Renderers** — Demonstrates `renderers` (input replacement) and `fieldRenderers` (complete field replacement)
- **Advanced** — Specialized input controls (rich text editor, rating, tag selector) via `renderers`
- **Material UI** — Material UI integration via `fieldRenderers`

### Contributing

Issues and pull requests are welcome.

Before submitting changes:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

---

## License

MIT
