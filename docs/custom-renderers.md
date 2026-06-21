# Custom Renderers

Custom renderers let you build entirely new field types that do not exist in MakeForm's built-in set. Use them when you need a UI widget that is not covered by the standard fields — rich text editors, map pickers, file uploads, or any other custom input.

## When To Use

| Scenario                                       | Approach                                             |
| ---------------------------------------------- | ---------------------------------------------------- |
| Change how a text input looks                  | Renderer override (`renderers.text`)                 |
| Change how a date input looks                  | Renderer override (`renderers.date`)                 |
| Add a widget that does not exist in MakeForm   | Custom renderer (`customField` + `renderers.custom`) |
| Need a complex value type (object, File, etc.) | Custom renderer                                      |

## Architecture

```
schema field (customField)
  ↓
component name (e.g. "richText")
  ↓
renderers.custom look-up
  ↓
custom renderer component
```

`customField<T>()` creates a field with `type: 'custom'` and a `component` name. At render time, `FieldRenderer` looks up that component name in `renderers.custom` and renders the matching component.

If no match is found, the label renders but no input appears.

## Props

Custom renderers receive a `CustomFieldRendererProps<TValue>` object:

| Prop       | Type                      | Description                                          |
| ---------- | ------------------------- | ---------------------------------------------------- |
| `id`       | `string`                  | Field identifier (same as the schema key)            |
| `name`     | `string`                  | Field name (same as the schema key)                  |
| `value`    | `TValue`                  | Current field value                                  |
| `errors`   | `string[]`                | Validation error messages                            |
| `touched`  | `boolean`                 | Whether the field has been touched                   |
| `dirty`    | `boolean`                 | Whether the field has been modified from its default |
| `setValue` | `(value: TValue) => void` | Update the field value in form state                 |

Call `setValue` to propagate changes back to the form engine. The form engine automatically tracks touched, dirty, and validation state.

> **Note:** Custom renderers do **not** receive a `className` prop. Use the `classNames` prop for built-in fields only.

## Simple Example

```tsx
import { useForm, FormRenderer, customField, textField, required } from '@hnpsaga/makeform';
import type { CustomFieldRendererProps } from '@hnpsaga/makeform';

function ColorPicker({ value, setValue }: CustomFieldRendererProps<string>) {
  return (
    <select value={value} onChange={(e) => setValue(e.target.value)}>
      <option value="">Select a color</option>
      <option value="red">Red</option>
      <option value="green">Green</option>
      <option value="blue">Blue</option>
    </select>
  );
}

const schema = {
  name: textField({ label: 'Name', validators: [required()] }),
  favoriteColor: customField<string>({ component: 'colorPicker', label: 'Favorite Color' }),
};

export default function App() {
  const form = useForm(schema);

  return (
    <FormRenderer
      form={form}
      schema={schema}
      renderers={{
        custom: {
          colorPicker: ColorPicker,
        },
      }}
    />
  );
}
```

## Rich Text Editor Example

```tsx
import { useForm, FormRenderer, customField } from '@hnpsaga/makeform';
import type { CustomFieldRendererProps } from '@hnpsaga/makeform';

function RichTextEditor({ value, setValue }: CustomFieldRendererProps<string>) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => setValue((e.target as HTMLElement).textContent || '')}
      style={{
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        padding: '0.5rem 0.75rem',
        minHeight: '6.25rem',
      }}
    >
      {value}
    </div>
  );
}

const schema = {
  bio: customField<string>({
    component: 'richText',
    label: 'Biography',
    defaultValue: '',
  }),
};

export default function App() {
  const form = useForm(schema);

  return (
    <FormRenderer
      form={form}
      schema={schema}
      renderers={{
        custom: {
          richText: RichTextEditor,
        },
      }}
    />
  );
}
```

## Date Picker Comparison

MakeForm provides `dateField()` for a standard date input and `customField` for advanced date picking.

### dateField — Simple Date Input

Use `dateField()` when a native `<input type="date">` is sufficient.

```tsx
import { dateField } from '@hnpsaga/makeform';

const schema = {
  birthday: dateField({ label: 'Birthday' }),
};
```

### customField — Advanced Date Picker

Use `customField` when you need a calendar widget, range picker, or custom date UI. The field value stays strongly typed as `Date`.

```tsx
import { useForm, FormRenderer, customField } from '@hnpsaga/makeform';
import type { CustomFieldRendererProps } from '@hnpsaga/makeform';

function CalendarPicker({ value, setValue }: CustomFieldRendererProps<Date>) {
  const dateStr =
    value instanceof Date && !isNaN(value.getTime()) ? value.toISOString().split('T')[0] : '';

  return (
    <div>
      <input type="date" value={dateStr} onChange={(e) => setValue(new Date(e.target.value))} />
      {value instanceof Date && !isNaN(value.getTime()) && <p>Selected: {value.toDateString()}</p>}
    </div>
  );
}

const schema = {
  appointment: customField<Date>({
    component: 'calendar',
    label: 'Appointment Date',
    defaultValue: new Date(),
  }),
};

export default function App() {
  const form = useForm(schema);

  return (
    <FormRenderer
      form={form}
      schema={schema}
      renderers={{
        custom: {
          calendar: CalendarPicker,
        },
      }}
    />
  );
}
```

## Phone Picker Example

```tsx
import { useForm, FormRenderer, customField } from '@hnpsaga/makeform';
import type { CustomFieldRendererProps } from '@hnpsaga/makeform';

function PhoneInput({ value, setValue }: CustomFieldRendererProps<string>) {
  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  return (
    <input
      type="tel"
      value={value}
      onChange={(e) => setValue(formatPhone(e.target.value))}
      placeholder="(555) 123-4567"
    />
  );
}

const schema = {
  phone: customField<string>({
    component: 'phonePicker',
    label: 'Phone Number',
  }),
};

export default function App() {
  const form = useForm(schema);

  return (
    <FormRenderer
      form={form}
      schema={schema}
      renderers={{
        custom: {
          phonePicker: PhoneInput,
        },
      }}
    />
  );
}
```

## File Upload Example

Custom renderers work with any value type, including `File`. Use `customField<File | null>` to build a file upload widget.

```tsx
import { useForm, FormRenderer, customField } from '@hnpsaga/makeform';
import type { CustomFieldRendererProps } from '@hnpsaga/makeform';

function FileUpload({ value, setValue }: CustomFieldRendererProps<File | null>) {
  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          setValue(file);
        }}
      />
      {value && (
        <p>
          {value.name} ({(value.size / 1024).toFixed(1)} KB)
        </p>
      )}
    </div>
  );
}

const schema = {
  resume: customField<File | null>({
    component: 'fileUpload',
    label: 'Resume',
  }),
};

export default function App() {
  const form = useForm(schema);

  return (
    <FormRenderer
      form={form}
      schema={schema}
      renderers={{
        custom: {
          fileUpload: FileUpload,
        },
      }}
    />
  );
}
```

## Validation Integration

Custom renderers participate in the full form lifecycle out of the box. Everything flows through the `setValue` call.

### State Lifecycle

| Event                               | `value`                       | `touched`          | `dirty`   | `errors`                                            |
| ----------------------------------- | ----------------------------- | ------------------ | --------- | --------------------------------------------------- |
| Initial render                      | `defaultValue` or `undefined` | `false`            | `false`   | `[]`                                                |
| User calls `setValue(newVal)`       | `newVal`                      | `true`             | `true`    | Cleared by `setValue`; re-evaluated on `validate()` |
| `form.validate()` called externally | unchanged                     | unchanged          | unchanged | Populated if validation fails                       |
| `form.reset()` called               | `defaultValue`                | `false`            | `false`   | `[]`                                                |
| `form.handleSubmit(cb)`             | current                       | all marked touched | unchanged | Validated; submit blocked if errors exist           |

### Adding Validators

```tsx
import { customField, required, email } from '@hnpsaga/makeform';

const schema = {
  bio: customField<string>({
    component: 'richText',
    label: 'Biography',
    validators: [required()],
  }),
};
```

The custom renderer displays errors through the standard `mf-error` container rendered by `FieldRenderer`. Error messages are accessible in the custom renderer via the `errors` prop.

## Best Practices

**Keep renderers focused.** Each custom renderer should handle one widget type. Do not branch logic inside a single renderer — create separate components and register each under its own component name.

**Call `setValue` to update state.** Never mutate form state directly. Always route value changes through the `setValue` callback provided in props.

**Handle the default value.** Check for `undefined` or `null` in your renderer if no `defaultValue` is set on the field.

**Use descriptive component names.** The `component` string maps to the key in `renderers.custom`. Choose names that describe the UI (e.g., `'richText'`, `'colorPicker'`, `'fileUpload'`).

**Type your fields.** Always provide a type parameter to `customField<T>()`. This ensures the `value`, `setValue`, and `InferValues` are correctly typed.

**Avoid `className` assumptions.** Custom renderers do not receive the `classNames` prop. Style your custom renderer independently.
