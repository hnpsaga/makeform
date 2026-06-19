# React Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a React Adapter for MakeForm that provides `useForm` and `useField` hooks for seamless, high-performance integration in React 18+ projects using `useSyncExternalStore` for targeted subscriptions.

**Architecture:** Extend the framework-agnostic `FormInstance` with a synchronous `getState()` query method, then build `useForm` (subscribes to entire state) and `useField` (uses cache and shallow comparison for targeted, field-specific updates).

**Tech Stack:** TypeScript, React 18+, Vitest, jsdom, `@testing-library/react`.

---

## File Structure Map

- **src/state/types.ts**: Add `getState(): FormState<InferValues<TSchema>>` to `FormInstance`.
- **src/state/createForm.ts**: Implement `getState()` on the returned form instance.
- **src/react/types.ts**: Define output types for `FieldState`.
- **src/react/useForm.ts**: Implement the `useForm` hook.
- **src/react/useField.ts**: Implement the `useField` hook with caching and custom snapshot comparison.
- **src/react/index.ts**: Barrel export the React hooks and types.
- **src/index.ts**: Re-export React hooks from the library's root entrypoint.
- **tsup.config.ts**: Explicitly configure `react` as an external dependency.
- **test/state/createForm.test.ts**: Add unit tests for `getState()`.
- **test/react/react.test.tsx**: Complete React testing suite covering rendering, updates, targeted subscriptions, validation, reset, dirty/touched, and cleanup.

---

### Task 1: Add getState() to Core Form Engine

**Files:**

- Modify: `src/state/types.ts:14-22`
- Modify: `src/state/createForm.ts:79-136`
- Test: `test/state/createForm.test.ts`

- [ ] **Step 1: Write tests for `getState()`**
      Add a new test inside `test/state/createForm.test.ts` at the end:

  ```ts
  it('returns current state synchronously with getState()', () => {
    const schema = {
      name: textField({ defaultValue: 'Alice' }),
      age: numberField({ defaultValue: 25 }),
    };
    const form = createForm(schema);

    // Initial check
    expect(form.getState()).toEqual({
      values: { name: 'Alice', age: 25 },
      errors: {},
      touched: { name: false, age: false },
      dirty: { name: false, age: false },
    });

    // Update state
    form.setValue('name', 'Bob');
    expect(form.getState().values.name).toBe('Bob');
    expect(form.getState().touched.name).toBe(true);
    expect(form.getState().dirty.name).toBe(true);

    // Validate state
    form.validate();
    expect(form.getState().errors).toEqual({});
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
      Run: `npm run test`
      Expected: FAIL with compilation error (getState does not exist on type FormInstance)

- [ ] **Step 3: Modify `src/state/types.ts` to add `getState` to `FormInstance`**

  ```ts
  export interface FormInstance<TSchema extends Record<string, any>> {
    getValues(): InferValues<TSchema>;
    getValue<K extends keyof InferValues<TSchema>>(field: K): InferValues<TSchema>[K];
    setValue<K extends keyof InferValues<TSchema>>(field: K, value: InferValues<TSchema>[K]): void;
    validate(): ValidationResult;
    reset(): void;
    subscribe(listener: Listener<InferValues<TSchema>>): () => void;
    unsubscribe(listener: Listener<InferValues<TSchema>>): void;
    getState(): FormState<InferValues<TSchema>>;
  }
  ```

- [ ] **Step 4: Modify `src/state/createForm.ts` to implement `getState`**

  ```ts
  return {
    getValues() {
      return { ...state.values };
    },
    getValue(field) {
      return state.values[field];
    },
    setValue(field, value) {
      const prevVal = state.values[field];
      const prevTouched = state.touched[field];
      const prevDirty = state.dirty[field];

      const nextVal = value;
      const nextTouched = true;
      const nextDirty = value !== initialValues[field];

      if (prevVal !== nextVal || prevTouched !== nextTouched || prevDirty !== nextDirty) {
        state.values = { ...state.values, [field]: nextVal };
        state.touched = { ...state.touched, [field]: nextTouched };
        state.dirty = { ...state.dirty, [field]: nextDirty };

        notify();
      }
    },
    validate() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = validateForm(schema as any, state.values as any);
      const changed = errorsChanged(state.errors, result.errors);
      if (changed) {
        state.errors = result.errors;
        notify();
      }
      return result;
    },
    reset() {
      state.values = { ...initialValues };
      state.errors = {};
      const nextTouched = {} as Record<keyof TValues, boolean>;
      const nextDirty = {} as Record<keyof TValues, boolean>;
      for (const key of Object.keys(schema) as (keyof TValues & string)[]) {
        nextTouched[key] = false;
        nextDirty[key] = false;
      }
      state.touched = nextTouched;
      state.dirty = nextDirty;
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    unsubscribe(listener) {
      listeners.delete(listener);
    },
    getState() {
      return {
        values: { ...state.values },
        errors: { ...state.errors },
        touched: { ...state.touched },
        dirty: { ...state.dirty },
      };
    },
  };
  ```

- [ ] **Step 5: Run tests to verify they pass**
      Run: `npm run test`
      Expected: PASS

- [ ] **Step 6: Commit**
  ```bash
  git add src/state/types.ts src/state/createForm.ts test/state/createForm.test.ts
  git commit -m "feat: add getState to FormInstance with tests"
  ```

---

### Task 2: Setup React Types and Configuration

**Files:**

- Create: `src/react/types.ts`
- Create: `src/react/index.ts`
- Modify: `src/index.ts`
- Modify: `tsup.config.ts`

- [ ] **Step 1: Create `src/react/types.ts`**

  ```ts
  export interface FieldState<TValue> {
    value: TValue;
    errors: string[];
    touched: boolean;
    dirty: boolean;
    setValue: (value: TValue) => void;
  }
  ```

- [ ] **Step 2: Create temporary dummy implementations for hooks in `src/react/useForm.ts` and `src/react/useField.ts`**
      `src/react/useForm.ts`:

  ```ts
  import type { FormInstance } from '../state/types.js';
  export function useForm<TSchema extends Record<string, any>>(
    _schema: TSchema,
  ): FormInstance<TSchema> {
    return {} as any;
  }
  ```

  `src/react/useField.ts`:

  ```ts
  import type { FormInstance } from '../state/types.js';
  import type { InferValues } from '../types/inference.js';
  import type { FieldState } from './types.js';
  export function useField<
    TSchema extends Record<string, any>,
    K extends keyof InferValues<TSchema> & string,
  >(_form: FormInstance<TSchema>, _name: K): FieldState<InferValues<TSchema>[K]> {
    return {} as any;
  }
  ```

- [ ] **Step 3: Create `src/react/index.ts`**

  ```ts
  export * from './useForm.js';
  export * from './useField.js';
  export * from './types.js';
  ```

- [ ] **Step 4: Update barrel exports in `src/index.ts`**
      Add the following line to the end of `src/index.ts`:

  ```ts
  export * from './react/index.js';
  ```

- [ ] **Step 5: Modify `tsup.config.ts` to configure `react` as external**

  ```ts
  import { defineConfig } from 'tsup';

  export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ['react'],
  });
  ```

- [ ] **Step 6: Run build and typecheck to verify setup is correct**
      Run: `npm run typecheck && npm run build`
      Expected: PASS

- [ ] **Step 7: Commit**
  ```bash
  git add src/react/types.ts src/react/index.ts src/react/useForm.ts src/react/useField.ts src/index.ts tsup.config.ts
  git commit -m "chore: setup react folder structure and exports"
  ```

---

### Task 3: Implement useForm Hook with Verification

**Files:**

- Modify: `src/react/useForm.ts`
- Test: `test/react/react.test.tsx`

- [ ] **Step 1: Write failing tests for `useForm`**
      Create `test/react/react.test.tsx` (using `jsdom` test environment block):

  ```tsx
  // @vitest-environment jsdom
  import { describe, expect, it, vi } from 'vitest';
  import React from 'react';
  import { render, screen, fireEvent, act } from '@testing-library/react';
  import { useForm, useField } from '../../src/index.js';
  import { textField, numberField } from '../../src/index.js';
  import { required } from '../../src/validation/validators.js';

  describe('useForm and useField hooks', () => {
    it('creates and preserves the form instance across renders and rerenders on state change', () => {
      const schema = { name: textField() };
      let formInstance1: any = null;
      let formInstance2: any = null;
      let renderCount = 0;

      const TestComponent = () => {
        renderCount++;
        const form = useForm(schema);
        if (renderCount === 1) {
          formInstance1 = form;
        } else {
          formInstance2 = form;
        }
        return <button onClick={() => form.setValue('name', 'Alice')}>Set Value</button>;
      };

      render(<TestComponent />);
      expect(renderCount).toBe(1);

      fireEvent.click(screen.getByText('Set Value'));
      expect(renderCount).toBe(2);
      expect(formInstance1).toBe(formInstance2); // same instance preserved
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
      Run: `npx vitest run test/react/react.test.tsx`
      Expected: FAIL (cannot set name of Alice on undefined or returned stub empty object)

- [ ] **Step 3: Write full implementation for `useForm` hook**
      In `src/react/useForm.ts`:

  ```ts
  import { useRef, useSyncExternalStore } from 'react';
  import { createForm } from '../state/createForm.js';
  import type { FormInstance } from '../state/types.js';

  export function useForm<TSchema extends Record<string, any>>(
    schema: TSchema,
  ): FormInstance<TSchema> {
    const formRef = useRef<FormInstance<TSchema> | null>(null);
    if (!formRef.current) {
      formRef.current = createForm(schema);
    }
    const form = formRef.current;

    useSyncExternalStore(
      form.subscribe,
      () => form.getState(),
      () => form.getState(),
    );

    return form;
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
      Run: `npx vitest run test/react/react.test.tsx`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/react/useForm.ts test/react/react.test.tsx
  git commit -m "feat: implement useForm hook with basic component rendering test"
  ```

---

### Task 4: Implement useField Hook with Targeted Subscriptions

**Files:**

- Modify: `src/react/useField.ts`
- Test: `test/react/react.test.tsx`

- [ ] **Step 1: Add comprehensive tests for `useField` and targeted re-renders**
      Append to `test/react/react.test.tsx`:

  ```tsx
  it('provides field specific state and targeted re-renders', () => {
    const schema = {
      name: textField({ defaultValue: 'Alice' }),
      age: numberField({ defaultValue: 30 }),
    };

    let nameRenderCount = 0;
    let ageRenderCount = 0;
    let mainRenderCount = 0;

    const NameField = ({ form }: { form: any }) => {
      nameRenderCount++;
      const name = useField(form, 'name');
      return (
        <input
          data-testid="name-input"
          value={name.value}
          onChange={(e) => name.setValue(e.target.value)}
        />
      );
    };

    const AgeField = ({ form }: { form: any }) => {
      ageRenderCount++;
      const age = useField(form, 'age');
      return <div data-testid="age-value">{age.value}</div>;
    };

    const FormComponent = () => {
      mainRenderCount++;
      const form = useForm(schema);
      return (
        <div>
          <NameField form={form} />
          <AgeField form={form} />
        </div>
      );
    };

    render(<FormComponent />);

    // Initial assertions
    expect(mainRenderCount).toBe(1);
    expect(nameRenderCount).toBe(1);
    expect(ageRenderCount).toBe(1);
    expect(screen.getByTestId('name-input').getAttribute('value')).toBe('Alice');
    expect(screen.getByTestId('age-value').textContent).toBe('30');

    // Change name -> name field should update, but NOT age field
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Bob' } });

    // Note: Since useForm is declared in the parent, the parent also re-renders.
    // That triggers children to re-render. To test targeted re-renders, the parent
    // must NOT call useForm, OR we can instantiate the form outside the parent or in a Ref
    // without subscribing the parent. Let's write a test specifically for this.
  });

  it('targeted subscription test without parent subscribing to the form', () => {
    const schema = {
      name: textField({ defaultValue: 'Alice' }),
      age: numberField({ defaultValue: 30 }),
    };

    // Form instance created outside or via a non-rendering reference
    // so the parent FormComponent doesn't trigger re-renders on every state update.
    const form = createForm(schema);

    let nameRenderCount = 0;
    let ageRenderCount = 0;

    const NameField = () => {
      nameRenderCount++;
      const name = useField(form, 'name');
      return (
        <input
          data-testid="name-input"
          value={name.value}
          onChange={(e) => name.setValue(e.target.value)}
        />
      );
    };

    const AgeField = () => {
      ageRenderCount++;
      const age = useField(form, 'age');
      return <div data-testid="age-value">{age.value}</div>;
    };

    render(
      <div>
        <NameField />
        <AgeField />
      </div>,
    );

    expect(nameRenderCount).toBe(1);
    expect(ageRenderCount).toBe(1);

    // Change name value
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Bob' } });

    expect(nameRenderCount).toBe(2);
    expect(ageRenderCount).toBe(1); // Targeted! Age field did not re-render!
  });

  it('tracks errors, dirty, and touched correctly inside useField', () => {
    const schema = {
      email: textField({ validators: [required()] }),
    };

    const FormComponent = () => {
      const form = useForm(schema);
      const email = useField(form, 'email');

      return (
        <div>
          <input
            data-testid="email"
            value={email.value}
            onChange={(e) => email.setValue(e.target.value)}
          />
          <button data-testid="validate" onClick={() => form.validate()}>
            Validate
          </button>
          <div data-testid="errors">{email.errors.join(', ')}</div>
          <div data-testid="dirty">{email.dirty ? 'dirty' : 'clean'}</div>
          <div data-testid="touched">{email.touched ? 'touched' : 'untouched'}</div>
          <button data-testid="reset" onClick={() => form.reset()}>
            Reset
          </button>
        </div>
      );
    };

    render(<FormComponent />);

    expect(screen.getByTestId('errors').textContent).toBe('');
    expect(screen.getByTestId('dirty').textContent).toBe('clean');
    expect(screen.getByTestId('touched').textContent).toBe('untouched');

    // Click validate (triggers error)
    fireEvent.click(screen.getByTestId('validate'));
    expect(screen.getByTestId('errors').textContent).toBe('Field is required');

    // Change value
    fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@example.com' } });
    expect(screen.getByTestId('dirty').textContent).toBe('dirty');
    expect(screen.getByTestId('touched').textContent).toBe('touched');

    // Revalidate to clear error
    fireEvent.click(screen.getByTestId('validate'));
    expect(screen.getByTestId('errors').textContent).toBe('');

    // Reset
    fireEvent.click(screen.getByTestId('reset'));
    expect(screen.getByTestId('dirty').textContent).toBe('clean');
    expect(screen.getByTestId('touched').textContent).toBe('untouched');
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
      Run: `npx vitest run test/react/react.test.tsx`
      Expected: FAIL on the new `useField` assertions

- [ ] **Step 3: Write full implementation for `useField` hook**
      In `src/react/useField.ts`:

  ```ts
  import { useSyncExternalStore, useRef, useCallback } from 'react';
  import type { FormInstance } from '../state/types.js';
  import type { InferValues } from '../types/inference.js';
  import type { FieldState } from './types.js';

  export function useField<
    TSchema extends Record<string, any>,
    K extends keyof InferValues<TSchema> & string,
  >(form: FormInstance<TSchema>, name: K): FieldState<InferValues<TSchema>[K]> {
    type TValue = InferValues<TSchema>[K];
    const cachedStateRef = useRef<FieldState<TValue> | null>(null);

    const getSnapshot = () => {
      const fullState = form.getState();
      const value = fullState.values[name] as TValue;
      const errors = fullState.errors[name] || [];
      const touched = fullState.touched[name] || false;
      const dirty = fullState.dirty[name] || false;

      if (cachedStateRef.current) {
        const current = cachedStateRef.current;
        const errorsChanged =
          current.errors.length !== errors.length ||
          current.errors.some((err, i) => err !== errors[i]);

        if (
          current.value === value &&
          !errorsChanged &&
          current.touched === touched &&
          current.dirty === dirty
        ) {
          return current;
        }
      }

      const nextState: FieldState<TValue> = {
        value,
        errors,
        touched,
        dirty,
        setValue: (val: TValue) => form.setValue(name, val),
      };
      cachedStateRef.current = nextState;
      return nextState;
    };

    const setValue = useCallback(
      (value: TValue) => {
        form.setValue(name, value);
      },
      [form, name],
    );

    const fieldState = useSyncExternalStore(form.subscribe, getSnapshot, getSnapshot);

    return {
      ...fieldState,
      setValue,
    };
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
      Run: `npx vitest run test/react/react.test.tsx`
      Expected: PASS

- [ ] **Step 5: Write compile-time type verification checks inside the test file**
      Add type safety checks at the bottom of `test/react/react.test.tsx`:

  ```tsx
  import { expectTypeOf } from 'vitest';

  it('verifies typescript inference for useForm and useField', () => {
    const schema = {
      name: textField(),
      age: numberField(),
    };

    const form = createForm(schema);

    // Verify useForm returns FormInstance
    expectTypeOf(useForm(schema)).toEqualTypeOf(form);

    // Verify useField value typings
    const nameField = useField(form, 'name');
    expectTypeOf(nameField.value).toEqualTypeOf<string>();
    expectTypeOf(nameField.setValue).toEqualTypeOf<(val: string) => void>();

    const ageField = useField(form, 'age');
    expectTypeOf(ageField.value).toEqualTypeOf<number>();
    expectTypeOf(ageField.setValue).toEqualTypeOf<(val: number) => void>();
  });
  ```

- [ ] **Step 6: Commit**
  ```bash
  git add src/react/useField.ts test/react/react.test.tsx
  git commit -m "feat: implement useField with targeted subscriptions and type tests"
  ```

---

### Task 5: README Updates & Quality Gate Checks

**Files:**

- Modify: `README.md`
- Test: All repository checks

- [ ] **Step 1: Update README.md with React Adapter Section**
      Add a section detailing `useForm` and `useField` hooks with code examples.

- [ ] **Step 2: Run formatting (Prettier)**
      Run: `npx prettier --write .`
      Expected: Format matches Prettier configuration.

- [ ] **Step 3: Run ESLint**
      Run: `npm run lint`
      Expected: No linting issues.

- [ ] **Step 4: Run full Typecheck**
      Run: `npm run typecheck`
      Expected: No TypeScript errors.

- [ ] **Step 5: Run all Vitest tests**
      Run: `npm run test`
      Expected: 100% tests pass.

- [ ] **Step 6: Run compilation/build**
      Run: `npm run build`
      Expected: Bundle builds successfully.

- [ ] **Step 7: Commit final updates**
  ```bash
  git add README.md
  git commit -m "docs: add react adapter section to README"
  ```
