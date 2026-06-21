# MakeForm Architecture

## Overview

MakeForm is a schema-driven form library for React built around a framework-agnostic core engine.

The architecture is intentionally layered:

```text
Schema Definition
        ↓
Type Inference
        ↓
Validation Engine
        ↓
State Engine
        ↓
React Adapter
        ↓
Rendering System
        ↓
Styling Layer
```

Each layer has a single responsibility and depends only on layers below it.

This separation allows MakeForm to provide strong TypeScript inference, dynamic form rendering, extensibility, and predictable state management without tightly coupling the core engine to React.

---

# Design Goals

MakeForm was designed around several core principles.

## Framework-Agnostic Core

The form engine should not depend on React.

All form state management, validation, subscriptions, and type inference live in the core engine.

React integration is implemented as a thin adapter layer.

This design allows future adapters for Vue, Svelte, Solid, or other frameworks without rewriting the core.

---

## Schema-First Development

A schema should be the single source of truth.

The schema defines:

- field types
- labels
- descriptions
- default values
- validation rules
- rendering metadata

Everything else derives from the schema.

---

## Strong Type Inference

TypeScript types should be inferred automatically from the schema.

Consumers should not need to manually create:

```ts
interface FormValues {}
```

The schema itself provides all necessary type information.

---

## Explicit Extensibility

Customization should be obvious and predictable.

Instead of plugin systems, global registries, or dependency injection containers, MakeForm exposes explicit extension points through:

- custom validators
- renderer overrides
- custom renderers
- styling overrides

---

## Minimal Runtime Complexity

The runtime implementation favors:

- plain objects
- immutable state
- predictable data flow
- explicit rendering logic

over abstraction-heavy architectures.

---

# High-Level Architecture

```text
┌───────────────────────────────┐
│           Schema              │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       Type Inference          │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│      Validation Engine        │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│        State Engine           │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│        React Adapter          │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│      Rendering System         │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│        Styling Layer          │
└───────────────────────────────┘
```

---

# Schema System

## Purpose

The schema system describes a form declaratively.

Example:

```ts
const schema = {
  name: textField({
    label: 'Name',
    validators: [required()],
  }),

  age: numberField({
    label: 'Age',
    validators: [min(18)],
  }),
};
```

The schema acts as the foundation for:

- type inference
- validation
- state initialization
- rendering

---

## Field Hierarchy

All field types extend:

```ts
BaseField<TValue>;
```

Examples include:

```text
TextField
NumberField
CheckboxField
TextareaField
EmailField
PhoneField
DateField
SelectField<T>
RadioField<T>
MultiSelectField<T>
CustomField<T>
```

Every field shares common metadata through `BaseField`.

---

## Field Factories

Field factories construct typed field definitions.

Examples:

```ts
textField();
numberField();
checkboxField();
selectField();
radioField();
customField();
```

Factories exist purely for developer experience and type inference.

They do not contain runtime logic.

---

# Type Inference Engine

## Purpose

The type inference engine derives form value types directly from schemas.

Example:

```ts
const schema = {
  name: textField(),
  age: numberField(),
};
```

Produces:

```ts
type Values = InferValues<typeof schema>;

/*
{
  name: string;
  age: number;
}
*/
```

---

## InferField

The fundamental building block is:

```ts
InferField<TField>;
```

which extracts the value type from a field.

Example:

```ts
InferField<TextField>;
```

becomes:

```ts
string;
```

---

## InferValues

`InferValues<TSchema>` maps over all schema fields and combines them into a form value type.

This inferred type propagates through:

```text
createForm()
useForm()
useField()
handleSubmit()
```

providing end-to-end type safety.

---

# Validation Engine

## Purpose

The validation engine executes field-level validation rules.

Validators are pure functions:

```ts
(value) => string | null;
```

Returning:

```text
null      → valid
string    → invalid
```

---

## Built-In Validators

MakeForm includes:

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

## Validation Flow

```text
Schema
   ↓
validateForm()
   ↓
validateField()
   ↓
Validator[]
   ↓
ValidationResult
```

---

## Error Accumulation

MakeForm intentionally accumulates all validation errors.

Example:

```ts
validators: [required(), min(3), pattern(/^[a-z]+$/)];
```

All validators execute.

The user receives complete feedback in a single validation pass.

---

# State Engine

## Purpose

The state engine is the heart of MakeForm.

It is implemented by:

```ts
createForm();
```

and contains no React dependencies.

---

## Stored State

The engine tracks:

```ts
values;
errors;
touched;
dirty;
```

for every field.

---

## Immutable State

All state is frozen.

Example:

```ts
Object.freeze(...)
```

is used throughout state creation.

Benefits include:

- mutation safety
- predictable updates
- reference-based change detection

---

## Core Operations

### Set Value

```text
setValue()
   ↓
create new state
   ↓
notify subscribers
```

---

### Validate

```text
validate()
   ↓
validateForm()
   ↓
update errors
   ↓
notify subscribers
```

---

### Reset

```text
reset()
   ↓
restore defaults
   ↓
clear touched
   ↓
clear dirty
```

---

### Submit

```text
handleSubmit()
   ↓
markAllTouched()
   ↓
validate()
   ↓
callback(values)
```

Submission callbacks execute only when validation succeeds.

---

# Subscription Model

## Purpose

The state engine exposes a lightweight subscription system.

```ts
subscribe(listener);
unsubscribe(listener);
```

---

## Implementation

Listeners are stored in a `Set`.

```text
Set<Listener>
```

Benefits:

- O(1) add/remove
- no duplicates
- simple lifecycle

---

## Update Flow

```text
State Change
      ↓
notify()
      ↓
all listeners
      ↓
React updates
```

---

# React Adapter

## Purpose

The React adapter bridges the framework-agnostic core engine with React.

Primary APIs:

```ts
useForm();
useField();
```

---

## useForm

Responsibilities:

- create form instance
- retain instance with `useRef`
- subscribe via `useSyncExternalStore`

The form instance remains stable for the component lifetime.

---

## useField

Provides field-level subscriptions.

Returns:

```ts
{
  (value, errors, touched, dirty, setValue);
}
```

---

## Rendering Optimization

`useField` implements field-level caching.

Result:

```text
Field A changes
        ↓
Field B does not re-render
```

This keeps rendering predictable and efficient.

---

# Rendering System

## Purpose

The rendering layer converts schemas into UI.

---

## FormRenderer

Responsible for:

- iterating schema fields
- creating field renderers
- applying layout structure

Example:

```tsx
<FormRenderer form={form} schema={schema} />
```

---

## FieldRenderer

Responsible for:

- field subscriptions
- labels
- validation errors
- renderer dispatch

---

## Dispatch Model

Rendering is driven by:

```ts
switch(field.type)
```

Examples:

```text
text
textarea
email
phone
number
date
checkbox
radio
select
multi-select
custom
```

This explicit dispatch model prioritizes clarity and maintainability.

---

# Renderer Overrides

## Purpose

Renderer overrides allow replacement of built-in UI components.

Example:

```tsx
<FormRenderer
  renderers={{
    text: CustomTextRenderer,
  }}
/>
```

---

## Resolution Order

```text
Consumer Override
        ↓
Built-In Renderer
```

Implemented as:

```ts
renderers?.text ?? builtInRenderers.text;
```

The consumer always takes precedence.

---

# Custom Renderers

## Purpose

Custom renderers support complex UI components.

Examples:

```text
Rich Text Editor
Phone Picker
Date Picker
Location Picker
File Upload
```

---

## Registration

Schema:

```ts
customField({
  component: 'richText',
});
```

Renderer:

```tsx
renderers={{
  custom: {
    richText: RichTextRenderer,
  },
}}
```

---

## Resolution Flow

```text
Custom Field
      ↓
component name
      ↓
renderers.custom
      ↓
renderer instance
```

---

## State Integration

Custom renderers automatically participate in:

- validation
- touched tracking
- dirty tracking
- reset
- submission

without requiring additional integration code.

---

# Styling System

## Purpose

MakeForm provides a default theme while allowing consumer customization.

---

## Default Theme

The default stylesheet includes:

```text
Form Layout
Labels
Inputs
Selects
Textareas
Checkboxes
Radio Groups
Error States
```

---

## Class Naming

All classes use the:

```text
mf-
```

prefix.

Examples:

```text
mf-form
mf-grid
mf-field
mf-label
mf-input
mf-error
```

---

## Styling Overrides

Consumers may append custom classes.

Example:

```tsx
<FormRenderer
  classNames={{
    input: 'my-input',
    error: 'my-error',
  }}
/>
```

---

## Class Merge Strategy

Default classes are preserved.

Example:

```html
<input class="mf-input my-input" />
```

This allows customization without replacing renderers.

---

# Repository Structure

```text
src/
├── fields/
├── schema/
├── state/
├── validation/
├── react/
│   └── renderer/
├── styles/
└── types/
```

Each module corresponds to a distinct architectural layer.

Dependencies flow in one direction only.

---

# Extension Points

MakeForm was designed with future extensibility in mind.

Natural extension areas include:

```text
Async Validation

Form-Level Validation

Additional Renderers

Additional Framework Adapters

Conditional Fields

Field Arrays
```

The current architecture intentionally keeps these concerns separate from the v0.1.0 core.

---

# Architectural Summary

MakeForm is built around a framework-agnostic form engine with a thin React integration layer.

Key characteristics:

- Schema-first design
- Strong type inference
- Immutable state management
- Explicit rendering architecture
- Predictable extensibility
- Minimal runtime complexity

The result is a form library that remains small, understandable, and extensible while supporting real-world application requirements.
