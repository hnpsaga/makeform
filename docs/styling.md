# Styling

MakeForm includes a default theme and two customization paths: styling overrides for cosmetic changes and renderer overrides for full UI replacement.

## Default Theme

MakeForm ships a minimal default CSS file at `src/styles/default.css`. Every built-in field renderer applies an `mf-*` class. The theme is intentionally lightweight — simple spacing, neutral colors, and indigo accent highlights.

| Class            | Element                                 |
| ---------------- | --------------------------------------- |
| `mf-form`        | Form wrapper                            |
| `mf-grid`        | Responsive grid container               |
| `mf-field`       | Individual field wrapper                |
| `mf-label`       | Field label                             |
| `mf-input`       | Text, email, phone, number, date inputs |
| `mf-textarea`    | Textarea element                        |
| `mf-select`      | Select and multi-select elements        |
| `mf-checkbox`    | Checkbox input                          |
| `mf-radio`       | Radio input                             |
| `mf-radio-group` | Radio button group container            |
| `mf-error`       | Error container                         |
| `mf-error__text` | Individual error message                |

## Importing Styles

```tsx
import '@hnpsaga/makeform/dist/styles/default.css';
```

You must import the CSS file in your application entry point. The styles are not automatically injected.

## Styling Override API

The `ClassNames` interface maps each themeable element to a custom CSS class string.

Styling overrides append custom classes rather than replacing MakeForm's default classes. This allows you to extend the default theme while preserving built-in styling and behavior.

```tsx
import type { ClassNames } from '@hnpsaga/makeform';

const customClasses: ClassNames = {
  form: 'my-form',
  grid: 'my-grid',
  field: 'my-field',
  label: 'my-label',
  input: 'my-input',
  textarea: 'my-textarea',
  select: 'my-select',
  checkbox: 'my-checkbox',
  radio: 'my-radio',
  error: 'my-error',
};
```

Pass the object to `FormRenderer` or `FieldRenderer` via the `classNames` prop:

```tsx
<FormRenderer form={form} schema={schema} classNames={customClasses} />
```

## Available Styling Hooks

| Key        | Applied To                                            | Default Class |
| ---------- | ----------------------------------------------------- | ------------- |
| `form`     | `<div>` wrapping all fields                           | `mf-form`     |
| `grid`     | `<div>` grid container                                | `mf-grid`     |
| `field`    | `<div>` wrapping each field                           | `mf-field`    |
| `label`    | `<label>` element                                     | `mf-label`    |
| `input`    | `<input>` elements (text, email, phone, number, date) | `mf-input`    |
| `textarea` | `<textarea>` element                                  | `mf-textarea` |
| `select`   | `<select>` and multi-select elements                  | `mf-select`   |
| `checkbox` | `<input type="checkbox">`                             | `mf-checkbox` |
| `radio`    | `<input type="radio">`                                | `mf-radio`    |
| `error`    | `<div>` containing error messages                     | `mf-error`    |

## Class Merge Behavior

MakeForm never removes its default classes. Your custom class is appended to the default class with a space separator.

```tsx
<FormRenderer form={form} schema={schema} classNames={{ field: 'my-field-group' }} />
```

Result: `class="mf-field my-field-group"`

Multiple classes in a single override are supported:

```tsx
classNames={{ input: 'w-full rounded border-gray-300' }}
```

Result: `class="mf-input w-full rounded border-gray-300"`

## Tailwind Example

```tsx
import '@hnpsaga/makeform/dist/styles/default.css';

const classNames = {
  form: 'max-w-2xl mx-auto p-6',
  grid: 'grid grid-cols-1 gap-6 md:grid-cols-2',
  field: 'flex flex-col gap-1',
  label: 'text-sm font-medium text-gray-700',
  input: 'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500',
  textarea: 'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500',
  select: 'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500',
  checkbox: 'h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500',
  radio: 'h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500',
  error: 'mt-1',
};

export default function App() {
  const form = useForm(schema);

  return <FormRenderer form={form} schema={schema} classNames={classNames} />;
}
```

## Bootstrap Example

```tsx
import '@hnpsaga/makeform/dist/styles/default.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const classNames = {
  form: 'container',
  grid: 'row',
  field: 'mb-3 col-12 col-md-6',
  label: 'form-label',
  input: 'form-control',
  textarea: 'form-control',
  select: 'form-select',
  checkbox: 'form-check-input',
  radio: 'form-check-input',
  error: 'invalid-feedback d-block',
};

export default function App() {
  const form = useForm(schema);

  return <FormRenderer form={form} schema={schema} classNames={classNames} />;
}
```

## When To Use Styling Overrides

Use `classNames` when you want to keep the built-in MakeForm rendering but change the visual appearance. This is the right choice when:

- You only need to change colors, spacing, typography, or layout
- You want the default field structure (label + input + error) unchanged
- You are integrating with a CSS framework like Tailwind or Bootstrap
- You do not need to change the HTML structure or behavior

## When To Use Renderer Overrides

Use renderer overrides (`renderers` prop) when you need to replace the entire UI for a field type. This is the right choice when:

- You need a completely different HTML structure
- You are using a third-party component library (e.g., Material UI, Ant Design)
- You need to add or remove wrapper elements
- You want custom behavior that goes beyond CSS

```tsx
import { TextField } from '@mui/material';

function MuiTextRenderer({
  id,
  name,
  value,
  onChange,
  className,
}: PrimitiveFieldRendererProps<string>) {
  return (
    <TextField
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      variant="outlined"
      size="small"
      fullWidth
    />
  );
}

<FormRenderer form={form} schema={schema} renderers={{ text: MuiTextRenderer }} />;
```

Custom renderers manage their own styling independently. see the [Custom Renderers](./custom-renderers.md) guide.

## Choosing the Right Customization Strategy

| Goal                                             | Approach                           |
| ------------------------------------------------ | ---------------------------------- |
| Change colors, fonts, spacing                    | `classNames`                       |
| Add CSS framework classes                        | `classNames`                       |
| Replace input with a component library widget    | `renderers` override               |
| Replace label + input + error structure          | `renderers` override               |
| Add a field type that does not exist in MakeForm | `customField` + `renderers.custom` |
| Complex value types (File, object, array)        | `customField` + `renderers.custom` |

### Strategy Reference

**`classNames`** — lightest weight. Keeps default rendering, appends your classes.

**`renderers` overrides** — medium weight. Replaces the input component for a built-in field type. The override receives `className` from `classNames`, so both strategies compose.

**`customField` + `renderers.custom`** — heaviest weight. Defines an entirely new field type with full control over rendering. Does not receive `className` from `classNames`.
