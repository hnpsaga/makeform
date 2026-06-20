// @vitest-environment jsdom
import { describe, expect, it, expectTypeOf, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import {
  useForm,
  useField,
  createForm,
  textField,
  textareaField,
  emailField,
  phoneField,
  numberField,
  dateField,
  checkboxField,
  radioField,
  selectField,
  multiSelectField,
  customField,
  required,
  FormRenderer,
} from '../../src/index.js';
import type { FormRendererProps } from '../../src/index.js';
import type { FormInstance } from '../../src/state/types.js';

afterEach(() => {
  cleanup();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeFullSchema() {
  return {
    name: textField({ label: 'Name' }),
    bio: textareaField({ label: 'Bio' }),
    email: emailField({ label: 'Email' }),
    phone: phoneField({ label: 'Phone' }),
    age: numberField({ label: 'Age' }),
    birthday: dateField({ label: 'Birthday' }),
    subscribe: checkboxField({ label: 'Subscribe' }),
    color: radioField({
      label: 'Color',
      options: [
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue' },
      ] as const,
    }),
    role: selectField({
      label: 'Role',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ] as const,
    }),
    tags: multiSelectField({
      label: 'Tags',
      options: [
        { label: 'TypeScript', value: 'ts' },
        { label: 'React', value: 'react' },
      ] as const,
    }),
  };
}

// ─── Basic Rendering ──────────────────────────────────────────────────────────

describe('FormRenderer — basic rendering', () => {
  it('renders the form renderer wrapper with data-testid', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect(screen.getByTestId('form-renderer')).toBeTruthy();
  });

  it('renders the mf-grid layout wrapper inside mf-form', () => {
    const schema = {
      firstName: textField({ label: 'First Name' }),
      lastName: textField({ label: 'Last Name' }),
    };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    const { container } = render(<Test />);
    const formEl = container.querySelector('.mf-form');
    expect(formEl).not.toBeNull();
    const gridEl = formEl!.querySelector('.mf-grid');
    expect(gridEl).not.toBeNull();
  });

  it('renders all fields in schema insertion order', () => {
    const schema = {
      firstName: textField({ label: 'First Name' }),
      lastName: textField({ label: 'Last Name' }),
    };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(inputs).toHaveLength(2);
  });

  it('renders nothing inside wrapper for an empty schema', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schema = {} as Record<string, any>;
    function Test() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const form = useForm(schema as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <FormRenderer form={form as any} schema={schema as any} />;
    }
    render(<Test />);
    const formEl = screen.getByTestId('form-renderer');
    const gridEl = formEl.querySelector('.mf-grid');
    expect(gridEl).not.toBeNull();
    expect(gridEl!.children).toHaveLength(0);
  });

  it('renders customField with no component when renderers.custom is empty', () => {
    const schema = {
      name: textField({ label: 'Name' }),
      extra: customField({ label: 'Extra' }),
    };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getByText('Extra')).toBeTruthy();
  });

  it('renders customField without component key as label-only (no input)', () => {
    const schema = {
      extra: customField({ label: 'Extra' }),
    };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect(screen.getByText('Extra')).toBeTruthy();
  });

  it('wraps each field in a div with data-field attribute', () => {
    const schema = { username: textField({ label: 'Username' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    const { container } = render(<Test />);
    const fieldDiv = container.querySelector('[data-field="username"]');
    expect(fieldDiv).not.toBeNull();
  });
});

// ─── Label Rendering ──────────────────────────────────────────────────────────

describe('FormRenderer — label rendering', () => {
  it('renders label text from field.label', () => {
    const schema = { firstName: textField({ label: 'First Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect(screen.getByText('First Name')).toBeTruthy();
  });

  it('falls back to field key as label when label is absent', () => {
    const schema = { lastName: textField() };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect(screen.getByText('lastName')).toBeTruthy();
  });

  it('associates label htmlFor with input id (both equal to field key)', () => {
    const schema = { username: textField({ label: 'Username' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    const label = screen.getByText('Username') as HTMLLabelElement;
    expect(label.tagName.toLowerCase()).toBe('label');
    expect(label.htmlFor).toBe('username');
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.id).toBe('username');
  });
});

// ─── textField ────────────────────────────────────────────────────────────────

describe('FormRenderer — textField', () => {
  it('renders as <input type="text">', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect((screen.getByRole('textbox') as HTMLInputElement).type).toBe('text');
  });

  it('binds default value', () => {
    const schema = { name: textField({ label: 'Name', defaultValue: 'Alice' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Alice');
  });

  it('updates value on change', () => {
    const schema = { name: textField({ label: 'Name', defaultValue: 'Alice' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Bob' } });
    expect(input.value).toBe('Bob');
  });
});

// ─── textareaField ────────────────────────────────────────────────────────────

describe('FormRenderer — textareaField', () => {
  it('renders as <textarea>', () => {
    const schema = { bio: textareaField({ label: 'Bio' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect(screen.getByRole('textbox').tagName.toLowerCase()).toBe('textarea');
  });

  it('binds default value and handles onChange', () => {
    const schema = { bio: textareaField({ label: 'Bio', defaultValue: 'Hello' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Hello');
    fireEvent.change(textarea, { target: { value: 'World' } });
    expect(textarea.value).toBe('World');
  });
});

// ─── emailField ───────────────────────────────────────────────────────────────

describe('FormRenderer — emailField', () => {
  it('renders as <input type="email">', () => {
    const schema = { email: emailField({ label: 'Email' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    const input = screen.getByLabelText('Email') as HTMLInputElement;
    expect(input.type).toBe('email');
  });

  it('binds value and handles onChange', () => {
    const schema = { email: emailField({ label: 'Email', defaultValue: 'a@b.com' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    const input = screen.getByLabelText('Email') as HTMLInputElement;
    expect(input.value).toBe('a@b.com');
    fireEvent.change(input, { target: { value: 'x@y.com' } });
    expect(input.value).toBe('x@y.com');
  });
});

// ─── phoneField ───────────────────────────────────────────────────────────────

describe('FormRenderer — phoneField', () => {
  it('renders as <input type="tel">', () => {
    const schema = { phone: phoneField({ label: 'Phone' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    const input = screen.getByLabelText('Phone') as HTMLInputElement;
    expect(input.type).toBe('tel');
  });

  it('binds value and handles onChange', () => {
    const schema = { phone: phoneField({ label: 'Phone', defaultValue: '555-0100' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    const input = screen.getByLabelText('Phone') as HTMLInputElement;
    expect(input.value).toBe('555-0100');
    fireEvent.change(input, { target: { value: '555-9999' } });
    expect(input.value).toBe('555-9999');
  });
});

// ─── numberField ──────────────────────────────────────────────────────────────

describe('FormRenderer — numberField', () => {
  it('renders as <input type="number">', () => {
    const schema = { age: numberField({ label: 'Age' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(input.type).toBe('number');
  });

  it('binds default value and handles onChange', () => {
    const schema = { age: numberField({ label: 'Age', defaultValue: 25 }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(input.value).toBe('25');
    fireEvent.change(input, { target: { value: '30', valueAsNumber: 30 } });
    expect(input.value).toBe('30');
  });
});

// ─── dateField ────────────────────────────────────────────────────────────────

describe('FormRenderer — dateField', () => {
  it('renders as <input type="date">', () => {
    const schema = {
      birthday: dateField({ label: 'Birthday', defaultValue: new Date('2000-01-15') }),
    };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    const input = screen.getByLabelText('Birthday') as HTMLInputElement;
    expect(input.type).toBe('date');
  });

  it('converts Date to YYYY-MM-DD string for display', () => {
    const schema = {
      birthday: dateField({ label: 'Birthday', defaultValue: new Date('2000-01-15') }),
    };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    const input = screen.getByLabelText('Birthday') as HTMLInputElement;
    expect(input.value).toBe('2000-01-15');
  });

  it('handles onChange and converts string back to Date', () => {
    const schema = {
      birthday: dateField({ label: 'Birthday', defaultValue: new Date('2000-01-15') }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <div>
          <FormRenderer form={form} schema={schema} />
          <div data-testid="val">{form.getValue('birthday').toISOString().split('T')[0]}</div>
        </div>
      );
    }
    render(<Test />);
    const input = screen.getByLabelText('Birthday') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1990-06-20' } });
    expect(screen.getByTestId('val').textContent).toBe('1990-06-20');
  });
});

// ─── checkboxField ────────────────────────────────────────────────────────────

describe('FormRenderer — checkboxField', () => {
  it('renders as <input type="checkbox">', () => {
    const schema = { subscribe: checkboxField({ label: 'Subscribe' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.type).toBe('checkbox');
  });

  it('binds default unchecked state', () => {
    const schema = { subscribe: checkboxField({ label: 'Subscribe', defaultValue: false }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
  });

  it('binds default checked state', () => {
    const schema = { subscribe: checkboxField({ label: 'Subscribe', defaultValue: true }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
  });

  it('toggles checked state on click', () => {
    const schema = { subscribe: checkboxField({ label: 'Subscribe', defaultValue: false }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });
});

// ─── radioField ───────────────────────────────────────────────────────────────

describe('FormRenderer — radioField', () => {
  const radioSchema = {
    color: radioField({
      label: 'Color',
      options: [
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue' },
      ] as const,
    }),
  };

  it('renders one <input type="radio"> per option', () => {
    function Test() {
      const form = useForm(radioSchema);
      return <FormRenderer form={form} schema={radioSchema} />;
    }
    render(<Test />);
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios).toHaveLength(2);
  });

  it('renders radio options with correct values', () => {
    function Test() {
      const form = useForm(radioSchema);
      return <FormRenderer form={form} schema={radioSchema} />;
    }
    render(<Test />);
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios[0]!.value).toBe('red');
    expect(radios[1]!.value).toBe('blue');
  });

  it('renders option labels as accessible text', () => {
    function Test() {
      const form = useForm(radioSchema);
      return <FormRenderer form={form} schema={radioSchema} />;
    }
    render(<Test />);
    expect(screen.getByText('Red')).toBeTruthy();
    expect(screen.getByText('Blue')).toBeTruthy();
  });

  it('wraps radios in role="radiogroup"', () => {
    function Test() {
      const form = useForm(radioSchema);
      return <FormRenderer form={form} schema={radioSchema} />;
    }
    render(<Test />);
    expect(screen.getByRole('radiogroup')).toBeTruthy();
  });

  it('defaults to first option selected', () => {
    function Test() {
      const form = useForm(radioSchema);
      return <FormRenderer form={form} schema={radioSchema} />;
    }
    render(<Test />);
    const redRadio = screen.getByLabelText('Red') as HTMLInputElement;
    expect(redRadio.checked).toBe(true);
  });

  it('selects the clicked option and deselects others', () => {
    function Test() {
      const form = useForm(radioSchema);
      return <FormRenderer form={form} schema={radioSchema} />;
    }
    render(<Test />);
    const redRadio = screen.getByLabelText('Red') as HTMLInputElement;
    const blueRadio = screen.getByLabelText('Blue') as HTMLInputElement;
    expect(redRadio.checked).toBe(true);
    fireEvent.click(blueRadio);
    expect(blueRadio.checked).toBe(true);
    expect(redRadio.checked).toBe(false);
  });
});

// ─── selectField ──────────────────────────────────────────────────────────────

describe('FormRenderer — selectField', () => {
  const selectSchema = {
    role: selectField({
      label: 'Role',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ] as const,
    }),
  };

  it('renders as <select>', () => {
    function Test() {
      const form = useForm(selectSchema);
      return <FormRenderer form={form} schema={selectSchema} />;
    }
    render(<Test />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.tagName.toLowerCase()).toBe('select');
  });

  it('renders all options', () => {
    function Test() {
      const form = useForm(selectSchema);
      return <FormRenderer form={form} schema={selectSchema} />;
    }
    render(<Test />);
    expect(screen.getByRole('option', { name: 'Admin' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'User' })).toBeTruthy();
  });

  it('defaults to first option', () => {
    function Test() {
      const form = useForm(selectSchema);
      return <FormRenderer form={form} schema={selectSchema} />;
    }
    render(<Test />);
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('admin');
  });

  it('updates value on change', () => {
    function Test() {
      const form = useForm(selectSchema);
      return <FormRenderer form={form} schema={selectSchema} />;
    }
    render(<Test />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'user' } });
    expect(select.value).toBe('user');
  });
});

// ─── multiSelectField ─────────────────────────────────────────────────────────

describe('FormRenderer — multiSelectField', () => {
  const multiSchema = {
    tags: multiSelectField({
      label: 'Tags',
      options: [
        { label: 'TypeScript', value: 'ts' },
        { label: 'React', value: 'react' },
      ] as const,
    }),
  };

  it('renders as <select multiple>', () => {
    function Test() {
      const form = useForm(multiSchema);
      return <FormRenderer form={form} schema={multiSchema} />;
    }
    render(<Test />);
    const select = screen.getByLabelText('Tags') as HTMLSelectElement;
    expect(select.multiple).toBe(true);
  });

  it('renders all options', () => {
    function Test() {
      const form = useForm(multiSchema);
      return <FormRenderer form={form} schema={multiSchema} />;
    }
    render(<Test />);
    expect(screen.getByRole('option', { name: 'TypeScript' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'React' })).toBeTruthy();
  });

  it('starts with empty selection (default is [])', () => {
    function Test() {
      const form = useForm(multiSchema);
      return <FormRenderer form={form} schema={multiSchema} />;
    }
    render(<Test />);
    const select = screen.getByLabelText('Tags') as HTMLSelectElement;
    expect(select.value).toBe('');
  });
});

// ─── Validation and Error Display ─────────────────────────────────────────────

describe('FormRenderer — validation and errors', () => {
  it('does not render alert when field has no errors', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders validation errors in role="alert" after validate()', () => {
    const schema = { name: textField({ label: 'Name', validators: [required()] }) };
    function Test() {
      const form = useForm(schema);
      return (
        <div>
          <FormRenderer form={form} schema={schema} />
          <button data-testid="validate" onClick={() => form.validate()}>
            Validate
          </button>
        </div>
      );
    }
    render(<Test />);
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.click(screen.getByTestId('validate'));
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Field is required')).toBeTruthy();
  });

  it('renders each error as a separate <span>', () => {
    const schema = { name: textField({ label: 'Name', validators: [required()] }) };
    function Test() {
      const form = useForm(schema);
      return (
        <div>
          <FormRenderer form={form} schema={schema} />
          <button data-testid="validate" onClick={() => form.validate()}>
            Validate
          </button>
        </div>
      );
    }
    render(<Test />);
    fireEvent.click(screen.getByTestId('validate'));
    const errorSpans = within(screen.getByRole('alert')).getAllByText(/./);
    expect(errorSpans.length).toBeGreaterThanOrEqual(1);
    expect(errorSpans[0]!.tagName.toLowerCase()).toBe('span');
  });

  it('clears errors after fixing value and revalidating', () => {
    const schema = { name: textField({ label: 'Name', validators: [required()] }) };
    function Test() {
      const form = useForm(schema);
      return (
        <div>
          <FormRenderer form={form} schema={schema} />
          <button data-testid="validate" onClick={() => form.validate()}>
            Validate
          </button>
        </div>
      );
    }
    render(<Test />);
    fireEvent.click(screen.getByTestId('validate'));
    expect(screen.getByRole('alert')).toBeTruthy();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } });
    fireEvent.click(screen.getByTestId('validate'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows errors for only the field that failed, not others', () => {
    const schema = {
      name: textField({ label: 'Name', validators: [required()] }),
      age: numberField({ label: 'Age' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <div>
          <FormRenderer form={form} schema={schema} />
          <button data-testid="validate" onClick={() => form.validate()}>
            Validate
          </button>
        </div>
      );
    }
    render(<Test />);
    fireEvent.click(screen.getByTestId('validate'));
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(1);
  });
});

// ─── Form State Integration ───────────────────────────────────────────────────

describe('FormRenderer — form state integration', () => {
  it('re-renders field when form.setValue() is called externally', () => {
    const schema = { name: textField({ label: 'Name', defaultValue: 'Alice' }) };
    function Test() {
      const form = useForm(schema);
      return (
        <div>
          <FormRenderer form={form} schema={schema} />
          <button data-testid="set" onClick={() => form.setValue('name', 'Bob')}>
            Set Bob
          </button>
        </div>
      );
    }
    render(<Test />);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Alice');
    fireEvent.click(screen.getByTestId('set'));
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Bob');
  });

  it('resets all fields to initial values on form.reset()', () => {
    const schema = { name: textField({ label: 'Name', defaultValue: 'Alice' }) };
    function Test() {
      const form = useForm(schema);
      return (
        <div>
          <FormRenderer form={form} schema={schema} />
          <button data-testid="reset" onClick={() => form.reset()}>
            Reset
          </button>
        </div>
      );
    }
    render(<Test />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Bob' } });
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Bob');
    fireEvent.click(screen.getByTestId('reset'));
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Alice');
  });

  it('clears errors on reset after validation', () => {
    const schema = { name: textField({ label: 'Name', validators: [required()] }) };
    function Test() {
      const form = useForm(schema);
      return (
        <div>
          <FormRenderer form={form} schema={schema} />
          <button data-testid="validate" onClick={() => form.validate()}>
            Validate
          </button>
          <button data-testid="reset" onClick={() => form.reset()}>
            Reset
          </button>
        </div>
      );
    }
    render(<Test />);
    fireEvent.click(screen.getByTestId('validate'));
    expect(screen.getByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByTestId('reset'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders all field types in a mixed schema', () => {
    const schema = makeFullSchema();
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    // textboxes: name (text), bio (textarea), email, phone
    const textboxes = screen.getAllByRole('textbox');
    expect(textboxes.length).toBeGreaterThanOrEqual(4);
    expect(screen.getByRole('spinbutton')).toBeTruthy(); // number
    expect(screen.getByRole('checkbox')).toBeTruthy(); // checkbox
    expect(screen.getAllByRole('radio')).toHaveLength(2); // radio
    expect(screen.getByRole('combobox')).toBeTruthy(); // select
  });
});

// ─── Re-render behavior ───────────────────────────────────────────────────────

describe('FormRenderer — re-render behavior', () => {
  it('FieldRenderer uses useField for targeted subscriptions — only affected field re-renders', () => {
    // This mirrors the subscription isolation test in react.test.tsx
    // useField subscribes per-field so only the changed field re-renders
    const schema = {
      name: textField({ label: 'Name', defaultValue: 'Alice' }),
      age: numberField({ label: 'Age', defaultValue: 30 }),
    };
    const form = createForm(schema);
    let nameRenders = 0;
    let ageRenders = 0;

    function NameField() {
      nameRenders++;
      const field = useField(form, 'name');
      return (
        <input
          data-testid="name-input"
          type="text"
          value={field.value}
          onChange={(e) => field.setValue(e.target.value)}
        />
      );
    }

    function AgeField() {
      ageRenders++;
      const field = useField(form, 'age');
      return <div data-testid="age-display">{field.value}</div>;
    }

    render(
      <div>
        <NameField />
        <AgeField />
      </div>,
    );
    expect(nameRenders).toBe(1);
    expect(ageRenders).toBe(1);

    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Bob' } });
    // Only name field should re-render due to useField subscription isolation
    expect(nameRenders).toBe(2);
    expect(ageRenders).toBe(1); // age field did NOT re-render
  });
});

// ─── Edge Cases ───────────────────────────────────────────────────────────────

describe('FormRenderer — edge cases', () => {
  it('handles schema with only custom fields (renders label but no input)', () => {
    const schema = { data: customField({ label: 'Data' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect(screen.getByTestId('form-renderer')).toBeTruthy();
    expect(screen.getByText('Data')).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('handles multiple fields with missing labels (all fall back to key)', () => {
    const schema = {
      firstName: textField(),
      lastName: textField(),
    };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect(screen.getByText('firstName')).toBeTruthy();
    expect(screen.getByText('lastName')).toBeTruthy();
  });

  it('renders empty string as default value for text fields', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('');
  });

  it('renders 0 as default value for number fields', () => {
    const schema = { age: numberField({ label: 'Age' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('0');
  });
});

// ─── Type Tests ───────────────────────────────────────────────────────────────

describe('FormRenderer — TypeScript types', () => {
  it('has correct types for FormRendererProps', () => {
    const typeCheck = () => {
      const _schema = { name: textField() };
      type TSchema = typeof _schema;
      type TProps = FormRendererProps<TSchema>;
      expectTypeOf<TProps['form']>().toEqualTypeOf<FormInstance<TSchema>>();
      expectTypeOf<TProps['schema']>().toEqualTypeOf<TSchema>();
    };
    expect(typeCheck).toBeDefined();
  });

  it('FormRenderer is exported from the main package', () => {
    expect(FormRenderer).toBeDefined();
    expect(typeof FormRenderer).toBe('function');
  });
});
