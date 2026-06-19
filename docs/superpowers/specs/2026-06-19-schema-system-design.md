# MakeForm Phase 2: Schema System Design Specification

## Overview

This specification details Phase 2 (Schema System) of `makeform`. The goal is to define a strongly-typed schema model that allows users to declaratively describe form fields, establishing the foundation for future type inference, validation, and React components.

---

## 1. Type Definitions (`src/types/field.ts`)

We define the basic building blocks of the form schema system. All fields implement a generic `BaseField` interface to specify common metadata (type, label, description, default value).

```typescript
export interface BaseField<TValue> {
  readonly type: string;
  readonly label?: string;
  readonly description?: string;
  readonly defaultValue?: TValue;
}

export interface TextField extends BaseField<string> {
  readonly type: 'text';
}

export interface NumberField extends BaseField<number> {
  readonly type: 'number';
}

export interface CheckboxField extends BaseField<boolean> {
  readonly type: 'checkbox';
}

export interface SelectOption {
  readonly label: string;
  readonly value: string;
}

export interface SelectField extends BaseField<string> {
  readonly type: 'select';
  readonly options: readonly SelectOption[];
}

export type FormField = TextField | NumberField | CheckboxField | SelectField;
```

---

## 2. Schema Definition (`src/schema/schema.ts`)

A Schema maps keys to their respective field definitions.

```typescript
import type { FormField } from '../types/field.js';

export type Schema = Record<string, FormField>;
```

---

## 3. Field Factory Functions (`src/fields/`)

Factory functions generate the typed field objects. They accept an optional configuration (with the exception of `selectField`, which requires `options`).

### Text Field (`src/fields/text.ts`)

```typescript
import type { TextField } from '../types/field.js';

export interface TextFieldConfig {
  label?: string;
  description?: string;
  defaultValue?: string;
}

export function textField(config: TextFieldConfig = {}): TextField {
  return {
    type: 'text',
    ...config,
  };
}
```

### Number Field (`src/fields/number.ts`)

```typescript
import type { NumberField } from '../types/field.js';

export interface NumberFieldConfig {
  label?: string;
  description?: string;
  defaultValue?: number;
}

export function numberField(config: NumberFieldConfig = {}): NumberField {
  return {
    type: 'number',
    ...config,
  };
}
```

### Checkbox Field (`src/fields/checkbox.ts`)

```typescript
import type { CheckboxField } from '../types/field.js';

export interface CheckboxFieldConfig {
  label?: string;
  description?: string;
  defaultValue?: boolean;
}

export function checkboxField(config: CheckboxFieldConfig = {}): CheckboxField {
  return {
    type: 'checkbox',
    ...config,
  };
}
```

### Select Field (`src/fields/select.ts`)

```typescript
import type { SelectField, SelectOption } from '../types/field.js';

export interface SelectFieldConfig {
  label?: string;
  description?: string;
  defaultValue?: string;
  options: readonly SelectOption[];
}

export function selectField(config: SelectFieldConfig): SelectField {
  return {
    type: 'select',
    ...config,
  };
}
```

---

## 4. Entrypoint and Re-exports (`src/index.ts`)

The library exports everything cleanly:

```typescript
// src/fields/index.ts
export { textField, type TextFieldConfig } from './text.js';
export { numberField, type NumberFieldConfig } from './number.js';
export { checkboxField, type CheckboxFieldConfig } from './checkbox.js';
export { selectField, type SelectFieldConfig } from './select.js';

// src/schema/index.ts
export { type Schema } from './schema.js';

// src/types/index.ts
export type {
  BaseField,
  TextField,
  NumberField,
  CheckboxField,
  SelectOption,
  SelectField,
  FormField,
} from './field.js';
```

---

## 5. Verification Plan

Unit tests in `test/fields.test.ts` (or equivalent) will assert:

- `textField`: Creates field object correctly, preserving label and default value.
- `numberField`: Creates field object correctly, preserving metadata.
- `checkboxField`: Creates field object correctly, preserving boolean default value.
- `selectField`: Creates field object correctly, preserving option lists.
- `Schema`: Composed fields are correctly typecheck-compatible.
