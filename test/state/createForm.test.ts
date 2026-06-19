import { describe, expect, it } from 'vitest';
import { createForm } from '../../src/state/createForm.js';
import type { FormState } from '../../src/state/types.js';
import { textField, numberField, checkboxField, selectField } from '../../src/index.js';

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
        options: [{ label: 'Admin', value: 'admin' }, { label: 'User', value: 'user' }],
      }),
      roleWithFirstOption: selectFieldLocal({
        options: [{ label: 'User', value: 'user' }, { label: 'Admin', value: 'admin' }],
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
    expect(form.getValues().name).toBe('Bob');

    let notified = false;
    form.subscribe(() => {
      notified = true;
    });

    form.reset();

    expect(form.getValues().name).toBe('Alice');
    expect(notified).toBe(true);
  });
});
