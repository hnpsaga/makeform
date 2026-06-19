# Form State Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a lightweight, framework-agnostic, and strongly-typed form state management engine for MakeForm that tracks values, errors, touched, and dirty state.

**Architecture:** Use a functional closure store style inside `createForm(schema)`. Internal mutable state is hidden, and public APIs are returned as a plain object, integrating seamlessly with the existing schema inference and validation engines.

**Tech Stack:** TypeScript, Vitest, Vitest Typecheck (`expectTypeOf`)

---

### Task 1: Type Definitions

Define the core state interfaces and instance method signatures.

**Files:**

- Create: `src/state/types.ts`
- Test: `test/state/types.test-d.ts`

- [ ] **Step 1: Write type safety check**
      Write a type-level test file `test/state/types.test-d.ts` to assert structure matches expectations.

  ```ts
  import { expectTypeOf, test } from 'vitest';
  import type { FormState, FormInstance } from '../../src/state/types.js';
  import type { TextField, NumberField } from '../../src/types/field.js';

  test('FormState and FormInstance type constraints', () => {
    type Schema = {
      name: TextField;
      age: NumberField;
    };
    type Values = {
      name: string;
      age: number;
    };

    expectTypeOf<FormState<Values>>().toEqualTypeOf<{
      values: Values;
      errors: Record<string, string[]>;
      touched: Record<keyof Values, boolean>;
      dirty: Record<keyof Values, boolean>;
    }>();
  });
  ```

- [ ] **Step 2: Run typecheck to verify it fails**
      Run: `npm run typecheck`
      Expected: FAIL (Cannot find module '../../src/state/types.js' or exports)

- [ ] **Step 3: Write type definitions**
      Create `src/state/types.ts`:

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

- [ ] **Step 4: Run typecheck to verify it passes**
      Run: `npm run typecheck`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/state/types.ts test/state/types.test-d.ts
  git commit -m "feat(state): add form state and form instance types"
  ```

---

### Task 2: Core Form Engine and Value Getters

Initialize state based on schema defaults and implement value retrieval methods.

**Files:**

- Create: `src/state/createForm.ts`
- Test: `test/state/createForm.test.ts`

- [ ] **Step 1: Write test for initialization and value retrieval**
      Create `test/state/createForm.test.ts`:

  ```ts
  import { describe, expect, it } from 'vitest';
  import { createForm } from '../../src/state/createForm.js';
  import { textField, numberField, checkboxField } from '../../src/index.js';

  describe('createForm values and getters', () => {
    it('resolves schema default values correctly', () => {
      const schema = {
        name: textField({ defaultValue: 'Alice' }),
        age: numberField(),
        agreed: checkboxField({ defaultValue: true }),
      };

      const form = createForm(schema);

      expect(form.getValues()).toEqual({
        name: 'Alice',
        age: 0,
        agreed: true,
      });

      expect(form.getValue('name')).toBe('Alice');
      expect(form.getValue('age')).toBe(0);
      expect(form.getValue('agreed')).toBe(true);
    });
  });
  ```

- [ ] **Step 2: Run tests to verify it fails**
      Run: `npm run test -- test/state/createForm.test.ts`
      Expected: FAIL (createForm is not defined)

- [ ] **Step 3: Implement createForm and getters**
      Create `src/state/createForm.ts`:

  ```ts
  import type { FormInstance, FormState, Listener } from './types.js';
  import type { InferValues } from '../types/inference.js';

  function getDefaultValue(field: any): any {
    if (field.defaultValue !== undefined) {
      return field.defaultValue;
    }
    switch (field.type) {
      case 'text':
        return '';
      case 'number':
        return 0;
      case 'checkbox':
        return false;
      case 'select':
        return field.options?.[0]?.value ?? '';
      default:
        return undefined;
    }
  }

  export function createForm<TSchema extends Record<string, any>>(
    schema: TSchema,
  ): FormInstance<TSchema> {
    type TValues = InferValues<TSchema>;

    const initialValues = {} as TValues;
    const touched = {} as Record<keyof TValues, boolean>;
    const dirty = {} as Record<keyof TValues, boolean>;

    for (const key of Object.keys(schema) as (keyof TSchema & string)[]) {
      const field = schema[key];
      initialValues[key] = getDefaultValue(field);
      touched[key] = false;
      dirty[key] = false;
    }

    const state: FormState<TValues> = {
      values: { ...initialValues },
      errors: {},
      touched,
      dirty,
    };

    const listeners = new Set<Listener<TValues>>();

    return {
      getValues() {
        return { ...state.values };
      },
      getValue(field) {
        return state.values[field];
      },
      setValue(field, value) {
        // Task 3
      },
      validate() {
        // Task 6
        return { valid: true, errors: {} };
      },
      reset() {
        // Task 5
      },
      subscribe(listener) {
        // Task 4
        return () => {};
      },
      unsubscribe(listener) {
        // Task 4
      },
    };
  }
  ```

- [ ] **Step 4: Run tests to verify it passes**
      Run: `npm run test -- test/state/createForm.test.ts`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/state/createForm.ts test/state/createForm.test.ts
  git commit -m "feat(state): initialize form state and implement getters"
  ```

---

### Task 3: Value modification, dirty, and touched tracking

Implement value setters that update touched/dirty status and notify subscribers when changed.

**Files:**

- Modify: `src/state/createForm.ts`
- Test: `test/state/createForm.test.ts`

- [ ] **Step 1: Write test for setValue, touched, and dirty tracking**
      Add tests inside `test/state/createForm.test.ts`:

  ```ts
  it('updates values and tracks touched and dirty states on setValue', () => {
    const schema = {
      name: textField({ defaultValue: 'Bob' }),
      age: numberField(),
    };

    const form = createForm(schema);

    // Initial check
    expect(form.getValue('name')).toBe('Bob');

    // Set same value
    form.setValue('name', 'Bob');
    // For touched/dirty checking, we will verify direct state transitions in pubsub later,
    // but getValue should still be correct.
    expect(form.getValue('name')).toBe('Bob');

    // Set different value
    form.setValue('name', 'Charlie');
    expect(form.getValue('name')).toBe('Charlie');
  });
  ```

- [ ] **Step 2: Run tests to verify they fail/type check**
      Run: `npm run test -- test/state/createForm.test.ts`
      Expected: FAIL on Charlie value since setValue does nothing right now.

- [ ] **Step 3: Implement setValue, touched, and dirty logic**
      Modify `src/state/createForm.ts`:

  ```ts
  // In createForm return object:
  setValue(field, value) {
    const prevVal = state.values[field];
    const prevTouched = state.touched[field];
    const prevDirty = state.dirty[field];

    const nextVal = value;
    const nextTouched = true;
    const nextDirty = value !== initialValues[field];

    if (prevVal !== nextVal || prevTouched !== nextTouched || prevDirty !== nextDirty) {
      state.values[field] = nextVal;
      state.touched[field] = nextTouched;
      state.dirty[field] = nextDirty;

      // Notify (to be implemented in Task 4)
      listeners.forEach(l => l({
        values: { ...state.values },
        errors: { ...state.errors },
        touched: { ...state.touched },
        dirty: { ...state.dirty },
      }));
    }
  }
  ```

- [ ] **Step 4: Run tests to verify it passes**
      Run: `npm run test -- test/state/createForm.test.ts`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/state/createForm.ts test/state/createForm.test.ts
  git commit -m "feat(state): implement setValue with touched and dirty tracking"
  ```

---

### Task 4: Pub/Sub Subscriptions

Implement form subscription and unsubscription mechanisms with copy-safe state emissions and guard notifications.

**Files:**

- Modify: `src/state/createForm.ts`
- Test: `test/state/createForm.test.ts`

- [ ] **Step 1: Write test for subscriptions and unsubscription**
      Add tests inside `test/state/createForm.test.ts`:

  ```ts
  it('supports subscription, notifications on state changes, and unsubscription', () => {
    const schema = { name: textField() };
    const form = createForm(schema);

    const states: any[] = [];
    const unsubscribe = form.subscribe((state) => {
      states.push(state);
    });

    // Set a new value -> notifies
    form.setValue('name', 'Dan');
    expect(states).toHaveLength(1);
    expect(states[0].values.name).toBe('Dan');
    expect(states[0].touched.name).toBe(true);
    expect(states[0].dirty.name).toBe(true);

    // Set same value -> no notification
    form.setValue('name', 'Dan');
    expect(states).toHaveLength(1);

    // Unsubscribe via callback
    unsubscribe();
    form.setValue('name', 'Eric');
    expect(states).toHaveLength(1); // Still 1

    // Unsubscribe via explicit method
    const states2: any[] = [];
    const listener = (state: any) => states2.push(state);
    form.subscribe(listener);
    form.setValue('name', 'Frank');
    expect(states2).toHaveLength(1);

    form.unsubscribe(listener);
    form.setValue('name', 'George');
    expect(states2).toHaveLength(1); // Still 1
  });
  ```

- [ ] **Step 2: Run tests to verify they fail**
      Run: `npm run test -- test/state/createForm.test.ts`
      Expected: FAIL on subscriber assertions.

- [ ] **Step 3: Implement subscription methods**
      Modify `src/state/createForm.ts`:

  ```ts
  // In return object:
  subscribe(listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  unsubscribe(listener) {
    listeners.delete(listener);
  }
  ```

- [ ] **Step 4: Run tests to verify they pass**
      Run: `npm run test -- test/state/createForm.test.ts`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/state/createForm.ts test/state/createForm.test.ts
  git commit -m "feat(state): implement pub/sub subscriptions"
  ```

---

### Task 5: Form State Reset

Implement the `reset()` API that restores all initial defaults and notifications.

**Files:**

- Modify: `src/state/createForm.ts`
- Test: `test/state/createForm.test.ts`

- [ ] **Step 1: Write test for resetting state**
      Add tests inside `test/state/createForm.test.ts`:

  ```ts
  it('resets form values, errors, touched, and dirty states and notifies subscribers', () => {
    const schema = { name: textField({ defaultValue: 'Alice' }) };
    const form = createForm(schema);

    form.setValue('name', 'Bob');
    expect(form.getValues().name).toBe('Bob');

    let notified = false;
    form.subscribe(() => {
      notified = true;
    });

    form.reset();

    expect(form.getValues().name).toBe('Alice');
    expect(notified).toBe(true);
  });
  ```

- [ ] **Step 2: Run tests to verify they fail**
      Run: `npm run test -- test/state/createForm.test.ts`
      Expected: FAIL on reset values validation.

- [ ] **Step 3: Implement reset**
      Modify `src/state/createForm.ts`:

  ```ts
  // In return object:
  reset() {
    state.values = { ...initialValues };
    state.errors = {};
    for (const key of Object.keys(schema) as (keyof TValues & string)[]) {
      state.touched[key] = false;
      state.dirty[key] = false;
    }
    listeners.forEach(l => l({
      values: { ...state.values },
      errors: { ...state.errors },
      touched: { ...state.touched },
      dirty: { ...state.dirty },
    }));
  }
  ```

- [ ] **Step 4: Run tests to verify they pass**
      Run: `npm run test -- test/state/createForm.test.ts`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/state/createForm.ts test/state/createForm.test.ts
  git commit -m "feat(state): implement reset form action"
  ```

---

### Task 6: Validation Integration

Integrate the existing `validateForm` engine. Update error state and only notify subscribers if the validation errors change.

**Files:**

- Modify: `src/state/createForm.ts`
- Test: `test/state/createForm.test.ts`

- [ ] **Step 1: Write validation integration tests**
      Add tests inside `test/state/createForm.test.ts`:

  ```ts
  import { required } from '../../src/validation/validators.js';

  it('runs validation, updates error state, and notifies on changes', () => {
    const schema = {
      name: textField({ validators: [required()] }),
    };
    const form = createForm(schema);

    let notifyCount = 0;
    form.subscribe(() => {
      notifyCount++;
    });

    // Initial validation -> invalid (empty string is default)
    const result = form.validate();
    expect(result.valid).toBe(false);
    expect(result.errors.name).toContain('Field is required');
    expect(notifyCount).toBe(1);

    // Validate again with same error -> no notify
    form.validate();
    expect(notifyCount).toBe(1);

    // Set valid value and validate -> valid, error cleared, notifies
    form.setValue('name', 'Bob'); //setValue itself notifies once -> notifyCount = 2
    const result2 = form.validate();
    expect(result2.valid).toBe(true);
    expect(result2.errors.name).toBeUndefined();
    expect(notifyCount).toBe(3);
  });
  ```

- [ ] **Step 2: Run tests to verify they fail**
      Run: `npm run test -- test/state/createForm.test.ts`
      Expected: FAIL on validation checks.

- [ ] **Step 3: Integrate validateForm and implement error comparison**
      Modify `src/state/createForm.ts`:

  ```ts
  import { validateForm } from '../validation/validateForm.js';

  function errorsChanged(a: Record<string, string[]>, b: Record<string, string[]>): boolean {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return true;
    for (const key of keysA) {
      const errA = a[key] || [];
      const errB = b[key] || [];
      if (errA.length !== errB.length) return true;
      for (let i = 0; i < errA.length; i++) {
        if (errA[i] !== errB[i]) return true;
      }
    }
    return false;
  }

  // In createForm return object:
  validate() {
    const result = validateForm(schema, state.values);
    const changed = errorsChanged(state.errors, result.errors);
    if (changed) {
      state.errors = result.errors;
      listeners.forEach(l => l({
        values: { ...state.values },
        errors: { ...state.errors },
        touched: { ...state.touched },
        dirty: { ...state.dirty },
      }));
    }
    return result;
  }
  ```

- [ ] **Step 4: Run tests to verify they pass**
      Run: `npm run test -- test/state/createForm.test.ts`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/state/createForm.ts test/state/createForm.test.ts
  git commit -m "feat(state): integrate validateForm with subscriber notification"
  ```

---

### Task 7: Entry Point Exports

Export types and the `createForm` function from the module barrel files.

**Files:**

- Modify: `src/state/index.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write test verifying library exports**
      Modify `test/index.test.ts`:

  ```ts
  import { expect, test } from 'vitest';
  import * as makeform from '../src/index.js';

  test('exports version and core features', () => {
    expect(makeform.version).toBe('0.0.1');
    expect(makeform.createForm).toBeTypeOf('function');
  });
  ```

- [ ] **Step 2: Run tests to verify it fails**
      Run: `npm run test -- test/index.test.ts`
      Expected: FAIL (createForm is not exported)

- [ ] **Step 3: Modify export index files**
      Modify `src/state/index.ts`:

  ```ts
  export { createForm } from './createForm.js';
  export * from './types.js';
  ```

  And check `src/index.ts` has `export * from './state/index.js';` (it already does).

- [ ] **Step 4: Run all tests to verify everything passes**
      Run: `npm run test`
      Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**
  ```bash
  git add src/state/index.ts test/index.test.ts
  git commit -m "feat(state): export form state engine APIs"
  ```

---

### Task 8: Complete Type Inference Verification

Add edge case typecheck assertions for createForm type inference.

**Files:**

- Create: `test/state/typecheck.test-d.ts`

- [ ] **Step 1: Add type tests**
      Create `test/state/typecheck.test-d.ts`:

  ```ts
  import { expectTypeOf, test } from 'vitest';
  import { createForm, textField, numberField } from '../../src/index.js';

  test('createForm type inference matches expected typing', () => {
    const schema = {
      name: textField(),
      age: numberField(),
    };

    const form = createForm(schema);

    // getValue/getValues inference
    expectTypeOf(form.getValues()).toEqualTypeOf<{ name: string; age: number }>();
    expectTypeOf(form.getValue('name')).toEqualTypeOf<string>();
    expectTypeOf(form.getValue('age')).toEqualTypeOf<number>();

    // setValue type assertions
    expectTypeOf(form.setValue('name', 'John')).toEqualTypeOf<void>();
    // @ts-expect-error - number cannot be assigned to name
    expectTypeOf(form.setValue('name', 123)).toEqualTypeOf<void>();
  });
  ```

- [ ] **Step 2: Run typecheck**
      Run: `npm run typecheck`
      Expected: PASS

- [ ] **Step 3: Commit**
  ```bash
  git add test/state/typecheck.test-d.ts
  git commit -m "test(state): verify strong type safety of createForm"
  ```

---

### Task 9: README Documentation Updates

Update the README to include the Form State Engine documentation.

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Update documentation**
      Modify `README.md` to add the "Form State" section before/after the Validation section. Show clear code examples of `createForm`, `getValues`, `getValue`, `setValue`, `validate`, `reset`, and `subscribe`.

- [ ] **Step 2: Build verification**
      Run: `npm run build`
      Expected: PASS

- [ ] **Step 3: Commit**
  ```bash
  git add README.md
  git commit -m "docs: add Form State Engine documentation"
  ```
