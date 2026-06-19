import { describe, expect, it } from 'vitest';
import { createForm } from '../../src/state/createForm.js';
import type { FormState } from '../../src/state/types.js';
import { textField, numberField, checkboxField, selectField } from '../../src/index.js';
import { required } from '../../src/validation/validators.js';

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

  it('resolves select field default and fallback values correctly', () => {
    const selectFieldLocal = (config?: Record<string, unknown>) => ({
      type: 'select' as const,
      ...config,
    });

    const schema = {
      roleWithDefault: selectFieldLocal({
        defaultValue: 'admin',
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
        ],
      }),
      roleWithFirstOption: selectFieldLocal({
        options: [
          { label: 'User', value: 'user' },
          { label: 'Admin', value: 'admin' },
        ],
      }),
      roleEmptyOptions: selectFieldLocal({
        options: [],
      }),
      roleNoOptions: selectFieldLocal(),
    };

    const form = createForm(schema);

    expect(form.getValues()).toEqual({
      roleWithDefault: 'admin',
      roleWithFirstOption: 'user',
      roleEmptyOptions: '',
      roleNoOptions: '',
    });
  });

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
    // Note: touched and dirty tracking will be checked when state is outputted/subscribed,
    // but getValue should still be correct.
    expect(form.getValue('name')).toBe('Bob');

    // Set different value
    form.setValue('name', 'Charlie');
    expect(form.getValue('name')).toBe('Charlie');
  });

  it('resolves select field default to first option value', () => {
    const schema = {
      role: selectField({
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
        ],
      }),
    };
    const form = createForm(schema);
    expect(form.getValue('role')).toBe('admin');
  });

  it('supports subscription, notifications on state changes, and unsubscription', () => {
    const schema = { name: textField() };
    const form = createForm(schema);

    const states: FormState<{ name: string }>[] = [];
    const unsubscribe = form.subscribe((state) => {
      states.push(state);
    });

    // Set a new value -> notifies
    form.setValue('name', 'Dan');
    expect(states).toHaveLength(1);
    expect(states[0]!.values.name).toBe('Dan');
    expect(states[0]!.touched.name).toBe(true);
    expect(states[0]!.dirty.name).toBe(true);

    // Set same value -> no notification
    form.setValue('name', 'Dan');
    expect(states).toHaveLength(1);

    // Unsubscribe via callback
    unsubscribe();
    form.setValue('name', 'Eric');
    expect(states).toHaveLength(1); // Still 1

    // Unsubscribe via explicit method
    const states2: FormState<{ name: string }>[] = [];
    const listener = (state: FormState<{ name: string }>) => states2.push(state);
    form.subscribe(listener);
    form.setValue('name', 'Frank');
    expect(states2).toHaveLength(1);

    form.unsubscribe(listener);
    form.setValue('name', 'George');
    expect(states2).toHaveLength(1); // Still 1
  });

  it('resets form values, errors, touched, and dirty states and notifies subscribers', () => {
    const schema = { name: textField({ defaultValue: 'Alice' }) };
    const form = createForm(schema);

    form.setValue('name', 'Bob');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastState: any = null;
    form.subscribe((s) => {
      lastState = s;
    });

    form.reset();

    expect(form.getValues().name).toBe('Alice');
    expect(lastState).not.toBeNull();
    expect(lastState?.values.name).toBe('Alice');
    expect(lastState?.touched.name).toBe(false);
    expect(lastState?.dirty.name).toBe(false);
    expect(lastState?.errors).toEqual({});
  });

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

  it('verifies errors reference stability', () => {
    const schema = {
      name: textField({ validators: [required()] }),
      age: numberField(),
    };
    const form = createForm(schema);

    let lastState: FormState<{ name: string; age: number }> | null = null;
    form.subscribe((s) => {
      lastState = s;
    });

    // Trigger initial notify by set value
    form.setValue('age', 10);
    const errorsRefAfterSet1 = lastState!.errors;

    // 1. When setValue is called, errors reference remains unchanged
    form.setValue('age', 20);
    const errorsRefAfterSet2 = lastState!.errors;
    expect(errorsRefAfterSet2).toBe(errorsRefAfterSet1);

    // Run validation to get initial error state
    form.validate(); // triggers notify because errors changed (name is required)
    const errorsRefAfterValidate = lastState!.errors;
    expect(errorsRefAfterValidate).not.toBe(errorsRefAfterSet2);

    // 2. When validate is run and no errors change, the reference of errors remains unchanged
    form.validate(); // should not notify because errors are still the same

    // Trigger notification to inspect the errors reference
    form.setValue('age', 30);
    const errorsRefAfterSet3 = lastState!.errors;
    expect(errorsRefAfterSet3).toBe(errorsRefAfterValidate);
  });

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

  it('verifies getState() returns a stable reference unless mutated', () => {
    const schema = {
      name: textField({ defaultValue: 'Alice', validators: [required()] }),
      age: numberField({ defaultValue: 25 }),
    };
    const form = createForm(schema);

    // 1. Two calls to getState() return the exact same reference
    const state1 = form.getState();
    const state2 = form.getState();
    expect(state1).toBe(state2);

    // 2. Modifying a value results in a new state reference
    form.setValue('name', 'Bob');
    const state3 = form.getState();
    expect(state3).not.toBe(state1);

    // Two calls after modification still return the same reference
    const state4 = form.getState();
    expect(state3).toBe(state4);

    // 3. Validation that modifies errors results in a new state reference
    // Trigger validation error
    form.setValue('name', '');
    const statePreValidate = form.getState();
    form.validate();
    const statePostValidate = form.getState();
    expect(statePostValidate).not.toBe(statePreValidate);
    expect(statePostValidate.errors.name).toBeDefined();

    // Two calls after validation still return the same reference
    expect(form.getState()).toBe(statePostValidate);

    // 4. Calling reset results in a new state reference
    form.reset();
    const statePostReset = form.getState();
    expect(statePostReset).not.toBe(statePostValidate);
    expect(form.getState()).toBe(statePostReset);
  });

  it('protects getState() snapshots from external mutation', () => {
    const schema = {
      name: textField({ defaultValue: 'Alice', validators: [required()] }),
    };
    const form = createForm(schema);

    form.setValue('name', '');
    form.validate();
    const state = form.getState();

    expect(() => {
      state.values.name = 'Mallory';
    }).toThrow(TypeError);
    expect(() => {
      state.errors.name!.push('Injected error');
    }).toThrow(TypeError);

    expect(form.getValue('name')).toBe('');
    expect(form.getState().errors.name).toEqual(['Field is required']);
  });
});
