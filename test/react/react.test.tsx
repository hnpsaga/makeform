// @vitest-environment jsdom
import { describe, expect, it, expectTypeOf } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  useForm,
  useField,
  createForm,
  textField,
  numberField,
  required,
} from '../../src/index.js';

describe('useForm and useField hooks', () => {
  it('creates and preserves the form instance across renders and rerenders on state change', () => {
    const schema = { name: textField() };
    let formInstance1: unknown = null;
    let formInstance2: unknown = null;
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

  it('targeted subscription test without parent subscribing to the form', () => {
    const schema = {
      name: textField({ defaultValue: 'Alice' }),
      age: numberField({ defaultValue: 30 }),
    };

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

  it('verifies typescript inference for useForm and useField', () => {
    const typeTest = () => {
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
    };

    expect(typeTest).toBeDefined();
  });
});
