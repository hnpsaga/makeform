# MakeForm

Lightweight schema-driven form library with strong TypeScript type inference.

## Status

**Under Development**

## Goals

- **Schema-driven forms**: Define form structure and rules in a single, readable schema.
- **Strong TypeScript inference**: Automatic types for form values, errors, and validation rules directly from your schema.
- **Validation support**: Efficient built-in and custom validation rules.
- **Great developer experience**: Minimal boilerplate, intuitive APIs, and comprehensive TypeScript autocomplete.

## Installation

```bash
npm install @hnpsaga/makeform
```

## Usage

### Defining a Schema

```ts
import { textField, numberField, selectField } from '@hnpsaga/makeform';

const schema = {
  name: textField({ label: 'Name' }),
  age: numberField({ label: 'Age' }),
  role: selectField({
    label: 'Role',
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
    ],
  }),
};
```

### Type Inference

```ts
import type { InferValues } from '@hnpsaga/makeform';

type FormValues = InferValues<typeof schema>;
// { name: string; age: number; role: 'admin' | 'user' }
```

## Field Builders

MakeForm provides a set of type-safe builder functions to define your form schema. Each builder defines a field's data type, default value, validation rules, and other metadata.

### `textField(config?)`

Defines a single-line text input field.

- **Inferred Type**: `string`
- **Default Value**: `''`
- **Config**: Extends `BaseField<string>`

```ts
const name = textField({ label: 'Name', defaultValue: 'John Doe' });
```

### `textareaField(config?)`

Defines a multi-line text area input field.

- **Inferred Type**: `string`
- **Default Value**: `''`
- **Config**: Extends `BaseField<string>`

```ts
const biography = textareaField({ label: 'Bio', defaultValue: 'Tell us about yourself...' });
```

### `numberField(config?)`

Defines a numeric input field.

- **Inferred Type**: `number`
- **Default Value**: `0`
- **Config**: Extends `BaseField<number>`

```ts
const age = numberField({ label: 'Age', defaultValue: 18 });
```

### `checkboxField(config?)`

Defines a boolean checkbox input.

- **Inferred Type**: `boolean`
- **Default Value**: `false`
- **Config**: Extends `BaseField<boolean>`

```ts
const marketingOptIn = checkboxField({ label: 'Subscribe to newsletter' });
```

### `emailField(config?)`

Defines an email input field.

- **Inferred Type**: `string`
- **Default Value**: `''`
- **Config**: Extends `BaseField<string>`

```ts
const email = emailField({ label: 'Email Address' });
```

### `phoneField(config?)`

Defines a phone number input field.

- **Inferred Type**: `string`
- **Default Value**: `''`
- **Config**: Extends `BaseField<string>`

```ts
const phone = phoneField({ label: 'Phone Number' });
```

### `dateField(config?)`

Defines a date input field.

- **Inferred Type**: `Date`
- **Default Value**: `new Date()` (the instant the form state is initialized)
- **Config**: Extends `BaseField<Date>`

```ts
const dateOfBirth = dateField({ label: 'Date of Birth' });
```

### `selectField(config)`

Defines a select dropdown field.

- **Inferred Type**: String union of option values
- **Default Value**: The value of the first option, or `''` if options are empty
- **Config**: Requires `options: readonly SelectOption[]`

```ts
const role = selectField({
  label: 'Role',
  options: [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ] as const,
});
```

### `radioField(config)`

Defines a radio button group.

- **Inferred Type**: String union of option values
- **Default Value**: The value of the first option, or `''` if options are empty
- **Config**: Requires `options: readonly SelectOption[]`

```ts
const colorPreference = radioField({
  label: 'Favorite Color',
  options: [
    { label: 'Red', value: 'red' },
    { label: 'Blue', value: 'blue' },
  ] as const,
});
```

### `multiSelectField(config)`

Defines a multi-select field (e.g. checkbox group or tag input).

- **Inferred Type**: Array of string union of option values (e.g., `('admin' | 'user')[]`)
- **Default Value**: `[]`
- **Config**: Requires `options: readonly SelectOption[]`

```ts
const userGroups = multiSelectField({
  label: 'Groups',
  options: [
    { label: 'Editors', value: 'editors' },
    { label: 'Viewers', value: 'viewers' },
  ] as const,
});
```

### `customField<TValue>(config?)`

Defines a custom/complex field type for nested structures or third-party components.

- **Inferred Type**: `TValue` (defaults to `unknown` if type parameter is omitted)
- **Default Value**: `undefined` (or the specified `defaultValue`)
- **Config**: Extends `BaseField<TValue>`

```ts
interface GeoLocation {
  latitude: number;
  longitude: number;
}

const location = customField<GeoLocation>({
  label: 'Coordinates',
  defaultValue: { latitude: 0, longitude: 0 },
});
```

## Validation

Attach validators directly to any field definition. Errors accumulate — all failing validators are collected, not just the first.

```ts
import {
  textField,
  numberField,
  required,
  min,
  max,
  pattern,
  custom,
  validateForm,
} from '@hnpsaga/makeform';

const schema = {
  name: textField({
    validators: [required(), min(3), max(50)],
  }),

  age: numberField({
    validators: [min(18), max(120)],
  }),

  email: textField({
    validators: [required(), pattern(/^[^@]+@[^@]+\.[^@]+$/, 'Invalid email address')],
  }),
};

const result = validateForm(schema, {
  name: '',
  age: 15,
  email: 'notanemail',
});

// result.valid  → false
// result.errors → {
//   name:  ['Field is required', 'Minimum length is 3'],
//   age:   ['Minimum value is 18'],
//   email: ['Invalid email address'],
// }
```

### Built-in Validators

| Validator              | Applies to | Description                                                       |
| ---------------------- | ---------- | ----------------------------------------------------------------- |
| `required()`           | any        | Fails for `null`, `undefined`, or empty/whitespace strings        |
| `min(n)`               | `string`   | Fails if string length < `n`                                      |
| `min(n)`               | `number`   | Fails if numeric value < `n`                                      |
| `max(n)`               | `string`   | Fails if string length > `n`                                      |
| `max(n)`               | `number`   | Fails if numeric value > `n`                                      |
| `pattern(regex, msg?)` | `string`   | Fails if value does not match `regex`                             |
| `email(msg?)`          | `string`   | Fails if value does not match standard email format               |
| `phone(msg?)`          | `string`   | Fails if value does not match simple phone number format          |
| `custom(fn)`           | any        | User-supplied function — return `null` (valid) or an error string |

### `required()`

Ensures the field is not empty.

```ts
textField({ validators: [required()] });
```

### `min(n)`

For strings, checks minimum character length. For numbers, checks minimum value.

```ts
textField({ validators: [min(3)] }); // at least 3 characters
numberField({ validators: [min(18)] }); // at least 18
```

### `max(n)`

For strings, checks maximum character length. For numbers, checks maximum value.

```ts
textField({ validators: [max(100)] }); // at most 100 characters
numberField({ validators: [max(65)] }); // at most 65
```

### `pattern(regex, message?)`

Validates a string against a regular expression.

```ts
textField({
  validators: [pattern(/^\d{5}$/, 'Must be a 5-digit ZIP code')],
});
```

### `email(message?)`

Validates that a string matches a standard email format.

```ts
emailField({
  validators: [email('Please enter a valid email address')],
});
```

### `phone(message?)`

Validates that a string matches a simple phone format.

```ts
phoneField({
  validators: [phone('Please enter a valid phone number')],
});
```

### `custom(fn)`

Provide any validation logic. Return `null` when valid, a string when invalid.

```ts
textField({
  validators: [custom((value) => (value.startsWith('https') ? null : 'URL must use HTTPS'))],
});
```

### `validateField(value, validators)`

Validates a single value against a list of validators. Returns `string[]` of errors.

```ts
import { validateField, required, min } from '@hnpsaga/makeform';

const errors = validateField('', [required(), min(3)]);
// ['Field is required', 'Minimum length is 3']
```

### `validateForm(schema, values)`

Validates all fields in a schema and returns a `ValidationResult`.

```ts
const result = validateForm(schema, values);
// { valid: boolean; errors: Record<string, string[]> }
```

### `ValidationResult`

```ts
type ValidationResult = {
  valid: boolean;
  errors: Record<string, string[]>;
};
```

## Form State Engine

Manage form state reactively using a framework-agnostic form controller.

### `createForm(schema)`

Initializes the form state engine with a schema, returning a form instance. Initial values are derived from `defaultValue` on the field configs, or fall back to:

- `text`, `textarea`, `email`, `phone`: `''`
- `number`: `0`
- `checkbox`: `false`
- `select`, `radio`: The value of the first option, or `''`
- `date`: `new Date()` (instantiated at initialization time)
- `multi-select`: `[]`
- `custom`: `undefined`

```ts
import { createForm, textField, numberField, checkboxField } from '@hnpsaga/makeform';

const schema = {
  name: textField({ defaultValue: 'Alice' }),
  age: numberField({ label: 'Age' }),
  acceptedTerms: checkboxField({ label: 'Terms and Conditions' }),
};

const form = createForm(schema);
```

### Form Instance API

A form instance returned by `createForm` exposes the following methods:

#### `getValues()`

Retrieves a copy of the current values of all fields.

```ts
const values = form.getValues();
// { name: 'Alice', age: 0, acceptedTerms: false }
```

#### `getValue(field)`

Retrieves the current value of a single field.

```ts
const name = form.getValue('name'); // 'Alice'
```

#### `setValue(field, value)`

Sets the value of a single field. This automatically marks the field as `touched` and updates its `dirty` flag (calculated by comparing the new value to its initial value). If any state actually changed, all active subscribers are notified.

```ts
form.setValue('name', 'Bob');
form.setValue('age', 25);
```

#### `validate()`

Validates all fields using the schema's validators. If the validation errors change, the form's `errors` state is updated and subscribers are notified. Returns a `ValidationResult`.

```ts
const result = form.validate();
// { valid: true, errors: {} }
```

#### `reset()`

Resets the form values back to their initial state, clears all errors, and resets the `touched` and `dirty` states of all fields to `false`. Subscribers are notified.

```ts
form.reset();
```

#### `subscribe(listener)`

Subscribes to form state changes. The listener is called with the current `FormState` whenever `values`, `errors`, `touched`, or `dirty` flags update. Returns an unsubscribe function.

```ts
const unsubscribe = form.subscribe((state) => {
  console.log('Form State Updated:', state);
  // state structure:
  // {
  //   values: { name: 'Alice', age: 25, acceptedTerms: false },
  //   errors: { age: ['Minimum value is 18'] },
  //   touched: { name: true, age: true, acceptedTerms: false },
  //   dirty: { name: false, age: true, acceptedTerms: false }
  // }
});

// Call the returned function to unsubscribe
unsubscribe();
```

## React Adapter

MakeForm provides a thin React integration layer on top of the core form engine.
All state management, validation, and type inference flows through the existing `createForm()` engine.

### useForm

Creates and manages a form instance for the lifetime of the component.

```tsx
import { useForm, textField, numberField } from '@hnpsaga/makeform';

const schema = {
  name: textField({ validators: [required()] }),
  age: numberField(),
};

function ExampleForm() {
  const form = useForm(schema);

  return <button onClick={() => form.validate()}>Validate</button>;
}
```

### useField

Subscribes a component to a specific field's state. Only re-renders when that
field's `value`, `errors`, `touched`, or `dirty` state changes — not on unrelated
field updates.

```tsx
import { useForm, useField, textField, numberField } from '@hnpsaga/makeform';

const schema = {
  name: textField(),
  age: numberField(),
};

function ExampleForm() {
  const form = useForm(schema);
  const name = useField(form, 'name');

  return (
    <div>
      <input value={name.value} onChange={(e) => name.setValue(e.target.value)} />
      {name.errors.map((error) => (
        <div key={error}>{error}</div>
      ))}
    </div>
  );
}
```

**`useField` returns:**
| Property | Type | Description |
|---|---|---|
| `value` | `TValue` | Current field value, typed from schema |
| `errors` | `string[]` | Current validation error messages |
| `touched` | `boolean` | Whether the field has been interacted with |
| `dirty` | `boolean` | Whether the value differs from its initial value |
| `setValue` | `(value: TValue) => void` | Update the field value |

### Requirements

React Adapter requires React 18 or later as a peer dependency:

```json
"peerDependencies": {
  "react": "^18.0.0 || ^19.0.0"
}
```
