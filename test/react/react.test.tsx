// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from '../../src/index.js';
import { textField } from '../../src/index.js';

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
