# Design Spec: Phase 5 — Form State Engine

## 1. Overview

The Form State Engine is a framework-agnostic TypeScript state management layer for the `makeform` library. It maintains values, errors, touched, and dirty state, coordinates field and form validation, supports reset actions, and provides a lightweight pub/sub system to notify subscribers on state changes. This engine serves as the core state foundation for the upcoming React adapter.

## 2. API Design

### `createForm(schema)`

Initializes the form state engine for a given schema.

### Form Instance Methods

- `getValues()`: Returns a copy of the current form values.
- `getValue(field)`: Returns the value of a specific field.
- `setValue(field, value)`: Updates the value of a field, sets the field's touched state to `true`, updates its dirty state, and notifies subscribers of the state change.
- `validate()`: Runs form-level validation using `validateForm()`, updates the error state, notifies subscribers if the error state has changed, and returns the `ValidationResult`.
- `reset()`: Reverts form values back to their defaults, clears errors, marks all fields as untouched and not dirty, and notifies subscribers.
- `subscribe(listener)`: Subscribes a listener function to state changes. Returns an `unsubscribe` function.
- `unsubscribe(listener)`: Explicitly unsubscribes a listener function from state changes.

## 3. Types & Interfaces

```ts
import type { ValidationResult } from '../validation/types.js';
import type { InferValues } from '../types/inference.js';

export interface FormState<TValues> {
  values: TValues;
  errors: Record<string, string[]>;
  touched: Record<keyof TValues, boolean>;
  dirty: Record<keyof TValues, boolean>;
}

export type Listener<TValues> = (state: FormState<TValues>) => void;

export interface FormInstance<TSchema extends Record<string, any>> {
  getValues(): InferValues<TSchema>;
  getValue<K extends keyof InferValues<TSchema>>(field: K): InferValues<TSchema>[K];
  setValue<K extends keyof InferValues<TSchema>>(field: K, value: InferValues<TSchema>[K]): void;
  validate(): ValidationResult;
  reset(): void;
  subscribe(listener: Listener<InferValues<TSchema>>): () => void;
  unsubscribe(listener: Listener<InferValues<TSchema>>): void;
}
```

## 4. State Model & Resolution

### Default Value Resolution

When initializing or resetting the form state:

- If a field config has `defaultValue` explicitly set, use it.
- Otherwise, resolve standard fallbacks based on field type:
  - `text`: `""`
  - `number`: `0`
  - `checkbox`: `false`
  - `select`: `options[0]?.value` (or `""` if empty)
  - Other/unknown: `undefined`

### State Transitions

- **touched**: Marked `true` for a field when `setValue(field, ...)` is called. Reset restores to `false`.
- **dirty**: A field is dirty if its current value is strictly unequal (`!==`) to its initial/default value.
- **errors**: Updates on `validate()`. If validation errors differ from current errors, update state and notify.
- **subscribers**: Notified only when a state transition changes values, touched, dirty, or errors.

## 5. Subscriptions

- Uses a `Set` to store listeners.
- Notifies listeners with a snapshot copy of the state to prevent mutation of the internal state.
- Skips notification if no actual state changes occur during updates.
- Supports both return function unsubscription and explicit `unsubscribe` method.

## 6. Testing Strategy

We will implement comprehensive tests covering:

- Correct TypeScript type inference on `getValue`, `setValue`, and return values.
- Default value resolution for all field types.
- Correct dirty and touched state updates on `setValue`.
- Validation integration updating error state and notifying on changes.
- Multi-listener subscriptions and unsubscribe workflows.
- Form resetting behavior restoring all default states.
- Edge cases including empty schemas.
