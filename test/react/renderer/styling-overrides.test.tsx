// @vitest-environment jsdom
import { describe, expect, it, expectTypeOf, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import {
  useForm,
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
  FormRenderer,
  FieldRenderer,
} from '../../../src/index.js';
import type { ClassNames, PrimitiveFieldRendererProps } from '../../../src/index.js';
import type { FormField } from '../../../src/types/field.js';

afterEach(() => {
  cleanup();
});

describe('Styling overrides — existing behavior unchanged', () => {
  it('renders default classes when classNames prop is omitted', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    const { container } = render(<Test />);
    expect(container.querySelector('.mf-form')).not.toBeNull();
    expect(container.querySelector('.mf-grid')).not.toBeNull();
    expect(container.querySelector('.mf-field')).not.toBeNull();
    expect(container.querySelector('.mf-label')).not.toBeNull();
    expect(container.querySelector('.mf-input')).not.toBeNull();
  });

  it('renders default classes when classNames is empty object', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} classNames={{}} />;
    }
    const { container } = render(<Test />);
    expect(container.querySelector('.mf-form')).not.toBeNull();
    expect(container.querySelector('.mf-grid')).not.toBeNull();
    expect(container.querySelector('.mf-field')).not.toBeNull();
    expect(container.querySelector('.mf-label')).not.toBeNull();
    expect(container.querySelector('.mf-input')).not.toBeNull();
  });
});

describe('Styling overrides — single class override', () => {
  it('overrides form class', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} classNames={{ form: 'custom-form' }} />;
    }
    const { container } = render(<Test />);
    const formEl = container.querySelector('.mf-form');
    expect(formEl).not.toBeNull();
    expect(formEl!.className).toContain('custom-form');
  });

  it('overrides input class', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} classNames={{ input: 'my-input' }} />;
    }
    const { container } = render(<Test />);
    const input = container.querySelector('.mf-input');
    expect(input).not.toBeNull();
    expect(input!.className).toContain('my-input');
  });

  it('overrides label class', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} classNames={{ label: 'my-label' }} />;
    }
    const { container } = render(<Test />);
    const label = container.querySelector('.mf-label');
    expect(label).not.toBeNull();
    expect(label!.className).toContain('my-label');
  });
});

describe('Styling overrides — multiple class overrides', () => {
  it('overrides multiple classes simultaneously', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          classNames={{
            form: 'my-form',
            input: 'my-input',
            label: 'my-label',
          }}
        />
      );
    }
    const { container } = render(<Test />);
    expect(container.querySelector('.mf-form')!.className).toContain('my-form');
    expect(container.querySelector('.mf-input')!.className).toContain('my-input');
    expect(container.querySelector('.mf-label')!.className).toContain('my-label');
  });

  it('overrides all field types', () => {
    const schema = {
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
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          classNames={{
            form: 'f',
            grid: 'g',
            field: 'fi',
            label: 'l',
            input: 'i',
            textarea: 'ta',
            select: 's',
            checkbox: 'cb',
            radio: 'r',
            error: 'e',
          }}
        />
      );
    }
    const { container } = render(<Test />);
    expect(container.querySelector('.mf-form')!.className).toBe('mf-form f');
    expect(container.querySelector('.mf-grid')!.className).toBe('mf-grid g');
    expect(container.querySelector('.mf-field')!.className).toContain('fi');
    expect(container.querySelector('.mf-label')!.className).toContain('l');
    expect(container.querySelector('.mf-input')!.className).toContain('i');
    expect(container.querySelector('.mf-textarea')!.className).toContain('ta');
    expect(container.querySelector('.mf-select')!.className).toContain('s');
    expect(container.querySelector('.mf-checkbox')!.className).toContain('cb');
    const radio = container.querySelector('.mf-radio');
    expect(radio).not.toBeNull();
    expect(radio!.className).toContain('r');
  });
});

describe('Styling overrides — default class retention', () => {
  it('retains mf-form when form override is provided', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} classNames={{ form: 'custom' }} />;
    }
    const { container } = render(<Test />);
    expect(container.querySelector('.mf-form')).not.toBeNull();
  });

  it('retains mf-input when input override is provided', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} classNames={{ input: 'custom' }} />;
    }
    const { container } = render(<Test />);
    expect(container.querySelector('.mf-input')).not.toBeNull();
  });
});

describe('Styling overrides — class merging behavior', () => {
  it('merges multiple custom classes in a single override', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} classNames={{ input: 'foo bar baz' }} />;
    }
    const { container } = render(<Test />);
    const input = container.querySelector('.mf-input')!;
    expect(input.className).toBe('mf-input foo bar baz');
  });

  it('produces class string with default first, then override', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} classNames={{ field: 'custom-field' }} />;
    }
    const { container } = render(<Test />);
    const field = container.querySelector('[data-field="name"]')!;
    expect(field.className).toBe('mf-field custom-field');
  });
});

describe('Styling overrides — renderer override compatibility', () => {
  it('works alongside a renderer override for a different field type', () => {
    function CustomText({ value, onChange, ...rest }: PrimitiveFieldRendererProps<string>) {
      return (
        <input
          {...rest}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-custom="text"
        />
      );
    }

    const schema = {
      name: textField({ label: 'Name' }),
      email: emailField({ label: 'Email' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          renderers={{ text: CustomText }}
          classNames={{ input: 'custom-input-class' }}
        />
      );
    }
    render(<Test />);
    const overrideInput = screen.getByRole('textbox', { name: 'Name' }) as HTMLInputElement;
    expect(overrideInput.dataset.custom).toBe('text');
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.className).toContain('custom-input-class');
  });

  it('passes className to a renderer override', () => {
    function CustomText({
      value,
      onChange,
      className,
      ...rest
    }: PrimitiveFieldRendererProps<string>) {
      return (
        <input
          {...rest}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
          data-custom="text"
        />
      );
    }

    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          renderers={{ text: CustomText }}
          classNames={{ input: 'override-class' }}
        />
      );
    }
    render(<Test />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.dataset.custom).toBe('text');
    expect(input.className).toBe('override-class');
  });
});

describe('Styling overrides — custom renderer compatibility', () => {
  it('does not pass classNames to custom renderers', () => {
    function CustomRenderer({
      value,
    }: {
      id: string;
      name: string;
      value: string;
      setValue: (v: string) => void;
    }) {
      return <input type="text" data-testid="custom" value={value} readOnly />;
    }

    const schema = {
      extra: customField<string>({ component: 'extra', label: 'Extra' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          renderers={{ custom: { extra: CustomRenderer } }}
          classNames={{ input: 'should-not-apply' }}
        />
      );
    }
    const { container } = render(<Test />);
    const input = container.querySelector('[data-testid="custom"]') as HTMLInputElement;
    expect(input.className).not.toContain('should-not-apply');
  });
});

describe('Styling overrides — FieldRenderer standalone', () => {
  it('accepts classNames prop when used standalone', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return (
        <FieldRenderer
          form={form}
          name="name"
          field={schema.name as FormField}
          classNames={{ field: 'custom-field', input: 'custom-input' }}
        />
      );
    }
    const { container } = render(<Test />);
    const field = container.querySelector('[data-field="name"]')!;
    expect(field.className).toContain('custom-field');
    expect(container.querySelector('.mf-input')!.className).toContain('custom-input');
  });
});

describe('Styling overrides — type safety', () => {
  it('ClassNames type has correct optional keys', () => {
    expectTypeOf<ClassNames>().toEqualTypeOf<{
      form?: string;
      grid?: string;
      field?: string;
      label?: string;
      input?: string;
      textarea?: string;
      select?: string;
      checkbox?: string;
      radio?: string;
      error?: string;
    }>();
  });
});
