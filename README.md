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

- `text`: `''`
- `number`: `0`
- `checkbox`: `false`
- `select`: The value of the first option, or `''`

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
