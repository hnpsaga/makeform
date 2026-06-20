# Design Spec: Phase 7 — Extended Field System

## 1. Overview

The Extended Field System expands the field types supported by MakeForm to meet realistic enterprise form scenarios. It introduces new primitive fields, choice fields, and an extensibility field without introducing UI rendering concerns. It also adds new email and phone validation rules, integrates validation/inference into the existing framework, and defines fallback default values.

This phase is purely logical and schema-focused; it does not introduce any styling, rendering, or custom registries.

## 2. API Design

### 2.1 New Field Factories

We will add the following field creation helper functions:

#### Primitive Fields

- `textareaField(config?)`: Creates a field of type `textarea` with string value representation.
- `emailField(config?)`: Creates a field of type `email` with string value representation.
- `dateField(config?)`: Creates a field of type `date` with `Date` object value representation.
- `phoneField(config?)`: Creates a field of type `phone` with string value representation.

#### Choice Fields

- `radioField(config)`: Creates a field of type `radio` representing a single choice selection from options.
- `multiSelectField(config)`: Creates a field of type `multi-select` representing multiple selections from options.

#### Extensibility Field

- `customField<T>(config?)`: Creates a field of type `custom` wrapping a user-supplied type `T`.

### 2.2 New Validators

We will add the following validator factories:

- `email(message?)`: Validates that a string matches a standard email pattern.
- `phone(message?)`: Validates that a string matches a simple phone number pattern.

## 3. Types & Interfaces

We will update `src/types/field.ts` to include the new field definitions:

```ts
export interface TextareaField extends BaseField<string> {
  readonly type: 'textarea';
}

export interface EmailField extends BaseField<string> {
  readonly type: 'email';
}

export interface DateField extends BaseField<Date> {
  readonly type: 'date';
}

export interface PhoneField extends BaseField<string> {
  readonly type: 'phone';
}

export interface RadioField<TValue extends string = string> extends BaseField<TValue> {
  readonly type: 'radio';
  readonly options: readonly SelectOption<TValue>[];
}

export interface MultiSelectField<TValue extends string = string> extends BaseField<TValue[]> {
  readonly type: 'multi-select';
  readonly options: readonly SelectOption<TValue>[];
}

export interface CustomField<TValue> extends BaseField<TValue> {
  readonly type: 'custom';
}

export type FormField =
  | TextField
  | NumberField
  | CheckboxField
  | SelectField
  | TextareaField
  | EmailField
  | DateField
  | PhoneField
  | RadioField
  | MultiSelectField
  | CustomField<any>;
```

## 4. Default Value Resolution

We will update `getDefaultValue` in `src/state/createForm.ts` to support the new field types:

- `textarea`: `""`
- `email`: `""`
- `phone`: `""`
- `date`: `new Date()` (resolved at form initialization time)
- `radio`: `options[0]?.value` (or `""` if empty)
- `multi-select`: `[]`
- `custom`: `undefined` (or explicit `defaultValue` if supplied)

## 5. Validation Logic

### `email(message?)`

- Matches the string against a reasonable, simple email regular expression, such as:
  `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Fails with a default error message of `"Invalid email format"` or the custom message.

### `phone(message?)`

- Matches the string against a generic phone number regular expression without country-specific checks, such as:
  `/^\+?[0-9\s\-()]{7,20}$/`
- Fails with a default error message of `"Invalid phone number format"` or the custom message.

## 6. Testing Strategy

We will implement:

- Field builder tests for each new field to verify properties are mapped correctly.
- Validator tests for `email()` and `phone()`.
- Type-level tests using `expectTypeOf` to verify inference:
  - `emailField` -> `string`
  - `phoneField` -> `string`
  - `dateField` -> `Date`
  - `textareaField` -> `string`
  - `radioField` -> option value type union
  - `multiSelectField` -> `string[]` (or string union array)
  - `customField<T>` -> `T`
- Verification of default values inside `createForm`.
- Integration validation tests verifying both `validateField()` and `validateForm()` behave correctly with the new validators and field types.
