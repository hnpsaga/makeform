# Schema System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phase 2 (Schema System) of MakeForm to define a strongly-typed schema model allowing declarative form description.

**Architecture:** Use plain-object TypeScript interfaces for field configurations and functional factory functions that return these configured field objects.

**Tech Stack:** TypeScript, Vitest, tsup, ESLint, Prettier

---

### Task 1: Type Definitions

**Files:**

- Create: `src/types/field.ts`

- [ ] **Step 1: Write type definitions**
      Create the file `src/types/field.ts` containing:

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

- [ ] **Step 2: Verify typecheck passes**
      Run: `npm run typecheck`
      Expected: PASS

- [ ] **Step 3: Commit**
      Run:
  ```bash
  git add src/types/field.ts
  git commit -m "feat: add schema field type definitions"
  ```

---

### Task 2: Schema Definition

**Files:**

- Create: `src/schema/schema.ts`

- [ ] **Step 1: Write Schema definition**
      Create the file `src/schema/schema.ts` containing:

  ```typescript
  import type { FormField } from '../types/field.js';

  export type Schema = Record<string, FormField>;
  ```

- [ ] **Step 2: Verify typecheck passes**
      Run: `npm run typecheck`
      Expected: PASS

- [ ] **Step 3: Commit**
      Run:
  ```bash
  git add src/schema/schema.ts
  git commit -m "feat: add Schema type definition"
  ```

---

### Task 3: Text Field Factory

**Files:**

- Create: `src/fields/text.ts`
- Create: `test/fields/text.test.ts`

- [ ] **Step 1: Write failing test**
      Create the file `test/fields/text.test.ts` containing:

  ```typescript
  import { expect, test } from 'vitest';
  import { textField } from '../../src/fields/text.js';

  test('creates field correctly', () => {
    const field = textField();
    expect(field.type).toBe('text');
    expect(field.label).toBeUndefined();
    expect(field.defaultValue).toBeUndefined();
  });

  test('preserves label and default value', () => {
    const field = textField({ label: 'Name', defaultValue: 'John' });
    expect(field.type).toBe('text');
    expect(field.label).toBe('Name');
    expect(field.defaultValue).toBe('John');
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
      Run: `npx vitest run test/fields/text.test.ts`
      Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implement minimal factory**
      Create the file `src/fields/text.ts` containing:

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

- [ ] **Step 4: Run test to verify it passes**
      Run: `npx vitest run test/fields/text.test.ts`
      Expected: PASS

- [ ] **Step 5: Commit**
      Run:
  ```bash
  git add src/fields/text.ts test/fields/text.test.ts
  git commit -m "feat: implement textField factory and tests"
  ```

---

### Task 4: Number Field Factory

**Files:**

- Create: `src/fields/number.ts`
- Create: `test/fields/number.test.ts`

- [ ] **Step 1: Write failing test**
      Create the file `test/fields/number.test.ts` containing:

  ```typescript
  import { expect, test } from 'vitest';
  import { numberField } from '../../src/fields/number.js';

  test('creates field correctly', () => {
    const field = numberField();
    expect(field.type).toBe('number');
    expect(field.label).toBeUndefined();
    expect(field.defaultValue).toBeUndefined();
  });

  test('preserves label and default value', () => {
    const field = numberField({ label: 'Age', defaultValue: 25 });
    expect(field.type).toBe('number');
    expect(field.label).toBe('Age');
    expect(field.defaultValue).toBe(25);
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
      Run: `npx vitest run test/fields/number.test.ts`
      Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implement minimal factory**
      Create the file `src/fields/number.ts` containing:

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

- [ ] **Step 4: Run test to verify it passes**
      Run: `npx vitest run test/fields/number.test.ts`
      Expected: PASS

- [ ] **Step 5: Commit**
      Run:
  ```bash
  git add src/fields/number.ts test/fields/number.test.ts
  git commit -m "feat: implement numberField factory and tests"
  ```

---

### Task 5: Checkbox Field Factory

**Files:**

- Create: `src/fields/checkbox.ts`
- Create: `test/fields/checkbox.test.ts`

- [ ] **Step 1: Write failing test**
      Create the file `test/fields/checkbox.test.ts` containing:

  ```typescript
  import { expect, test } from 'vitest';
  import { checkboxField } from '../../src/fields/checkbox.js';

  test('creates field correctly', () => {
    const field = checkboxField();
    expect(field.type).toBe('checkbox');
    expect(field.label).toBeUndefined();
    expect(field.defaultValue).toBeUndefined();
  });

  test('preserves label and boolean default value', () => {
    const field = checkboxField({ label: 'Subscribed', defaultValue: true });
    expect(field.type).toBe('checkbox');
    expect(field.label).toBe('Subscribed');
    expect(field.defaultValue).toBe(true);
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
      Run: `npx vitest run test/fields/checkbox.test.ts`
      Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implement minimal factory**
      Create the file `src/fields/checkbox.ts` containing:

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

- [ ] **Step 4: Run test to verify it passes**
      Run: `npx vitest run test/fields/checkbox.test.ts`
      Expected: PASS

- [ ] **Step 5: Commit**
      Run:
  ```bash
  git add src/fields/checkbox.ts test/fields/checkbox.test.ts
  git commit -m "feat: implement checkboxField factory and tests"
  ```

---

### Task 6: Select Field Factory

**Files:**

- Create: `src/fields/select.ts`
- Create: `test/fields/select.test.ts`

- [ ] **Step 1: Write failing test**
      Create the file `test/fields/select.test.ts` containing:

  ```typescript
  import { expect, test } from 'vitest';
  import { selectField } from '../../src/fields/select.js';

  test('creates field correctly with options', () => {
    const field = selectField({
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    });
    expect(field.type).toBe('select');
    expect(field.options).toEqual([
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
    ]);
  });

  test('preserves label and default value', () => {
    const field = selectField({
      label: 'Role',
      defaultValue: 'user',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    });
    expect(field.type).toBe('select');
    expect(field.label).toBe('Role');
    expect(field.defaultValue).toBe('user');
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
      Run: `npx vitest run test/fields/select.test.ts`
      Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implement minimal factory**
      Create the file `src/fields/select.ts` containing:

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

- [ ] **Step 4: Run test to verify it passes**
      Run: `npx vitest run test/fields/select.test.ts`
      Expected: PASS

- [ ] **Step 5: Commit**
      Run:
  ```bash
  git add src/fields/select.ts test/fields/select.test.ts
  git commit -m "feat: implement selectField factory and tests"
  ```

---

### Task 7: Re-exports & Entrypoints

**Files:**

- Modify: `src/fields/index.ts`
- Modify: `src/schema/index.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: Update src/fields/index.ts**
      Replace contents of `src/fields/index.ts` with:

  ```typescript
  export { textField, type TextFieldConfig } from './text.js';
  export { numberField, type NumberFieldConfig } from './number.js';
  export { checkboxField, type CheckboxFieldConfig } from './checkbox.js';
  export { selectField, type SelectFieldConfig } from './select.js';
  ```

- [ ] **Step 2: Update src/schema/index.ts**
      Replace contents of `src/schema/index.ts` with:

  ```typescript
  export { type Schema } from './schema.js';
  ```

- [ ] **Step 3: Update src/types/index.ts**
      Replace contents of `src/types/index.ts` with:

  ```typescript
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

- [ ] **Step 4: Verify typecheck passes**
      Run: `npm run typecheck`
      Expected: PASS

- [ ] **Step 5: Commit**
      Run:
  ```bash
  git add src/fields/index.ts src/schema/index.ts src/types/index.ts
  git commit -m "feat: update project re-exports"
  ```

---

### Task 8: Schema Integration and Composition Verification

**Files:**

- Create: `test/schema.test.ts`

- [ ] **Step 1: Write integration test**
      Create the file `test/schema.test.ts` containing:

  ```typescript
  import { expect, test } from 'vitest';
  import { textField, numberField, checkboxField, selectField } from '../src/index.js';
  import type { Schema } from '../src/index.js';

  test('schemas can be composed and typechecked', () => {
    const userSchema: Schema = {
      name: textField({ label: 'Name', defaultValue: 'John' }),
      age: numberField({ label: 'Age', defaultValue: 30 }),
      subscribed: checkboxField({ label: 'Subscribe', defaultValue: true }),
      role: selectField({
        label: 'Role',
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
        ],
      }),
    };

    expect(userSchema.name.type).toBe('text');
    expect(userSchema.age.type).toBe('number');
    expect(userSchema.subscribed.type).toBe('checkbox');
    expect(userSchema.role.type).toBe('select');
  });
  ```

- [ ] **Step 2: Run all tests**
      Run: `npm run test`
      Expected: PASS

- [ ] **Step 3: Run full verification build**
      Run: `npm run lint && npm run typecheck && npm run build`
      Expected: PASS

- [ ] **Step 4: Commit**
      Run:
  ```bash
  git add test/schema.test.ts
  git commit -m "test: add integration test for schema composition"
  ```
