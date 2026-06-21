# MakeForm

Schema-driven TypeScript forms for React.

Build forms with strong type inference, validation, state management, dynamic rendering, and extensible UI customization — all from a single schema.

---

## Why MakeForm?

Most form libraries force you to choose between:

- Strong typing
- Dynamic form generation
- Flexible UI customization

MakeForm provides all three.

Define your form once and get:

✅ Strong TypeScript inference

✅ Built-in validation

✅ Form state management

✅ Dynamic form rendering

✅ React integration

✅ Renderer overrides

✅ Custom field support

✅ Styling overrides

✅ Framework-agnostic core engine

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

---

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

---

### Dynamic Form Rendering

Render complete forms directly from a schema.

```tsx
<FormRenderer form={form} schema={schema} />
```

No manual wiring required.

---

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

---

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

Schemas define:

- Field types
- Labels
- Default values
- Validation rules
- Rendering metadata

Example:

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

---

### 2. Type Inference

Generate form value types automatically.

```ts
type FormValues = InferValues<typeof schema>;
```

No manual interfaces required.

---

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

---

### 4. Form Submission

MakeForm includes a submission helper.

```ts
const submit = form.handleSubmit((values) => {
  console.log(values);
});

submit();
```

`handleSubmit()` automatically:

1. Marks all fields as touched
2. Runs validation
3. Prevents invalid submission
4. Returns strongly typed values

---

## Form State Engine

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

---

## React Integration

### useForm

Creates and manages a form instance.

```tsx
const form = useForm(schema);
```

---

### useField

Subscribe to a single field.

```tsx
const name = useField(form, 'name');
```

Returns:

```ts
{
  (value, errors, touched, dirty, setValue);
}
```

Only re-renders when that field changes.

---

## Dynamic Form Rendering

### FormRenderer

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

---

## Renderer Overrides

Replace built-in field renderers.

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

---

## Custom Renderers

Integrate third-party components.

Examples:

- Rich text editors
- Date pickers
- Phone pickers
- File uploads
- Typeahead inputs
- Location pickers

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

Custom renderers automatically participate in:

- Validation
- State updates
- Dirty tracking
- Touched tracking
- Reset
- Submission

---

## Default Theme

MakeForm ships with a clean default theme.

Import:

```ts
import '@hnpsaga/makeform/dist/styles/default.css';
```

Includes:

- Responsive layout
- Labels
- Inputs
- Selects
- Textareas
- Checkboxes
- Radio groups
- Error states

---

## Styling Overrides

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

Default styles remain active.

Custom classes are appended.

---

## Architecture

MakeForm consists of five layers:

```text
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

The form engine itself is framework agnostic.

React integration is intentionally thin.

---

## Roadmap

### Current

- Schema System
- Type Inference
- Validation
- Form State
- Submission API
- Dynamic Rendering
- Renderer Overrides
- Custom Renderers
- Styling Overrides

### Planned

- Form-level validation
- Async validation

See GitHub issues for details.

---

## Demo Application

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

---

## Contributing

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
