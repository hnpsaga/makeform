// @vitest-environment jsdom
import { describe, expect, it, expectTypeOf, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  useForm,
  textField,
  textareaField,
  emailField,
  FormRenderer,
  FieldRenderer,
} from '../../../src/index.js';
import type {
  Renderers,
  PrimitiveFieldRendererProps,
  FormRendererProps,
} from '../../../src/index.js';

afterEach(() => {
  cleanup();
});

describe('FormRenderer — renderer overrides', () => {
  it('renders with built-in renderers when no renderers prop given', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect((screen.getByRole('textbox') as HTMLInputElement).type).toBe('text');
  });

  it('renders with built-in renderers when renderers prop is empty', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} renderers={{}} />;
    }
    render(<Test />);
    expect((screen.getByRole('textbox') as HTMLInputElement).type).toBe('text');
  });

  it('overrides a single text renderer', () => {
    function CustomTextRenderer({
      id,
      name,
      value,
      onChange,
    }: PrimitiveFieldRendererProps<string>) {
      return (
        <input
          type="text"
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-custom="text"
        />
      );
    }

    const schema = { name: textField({ label: 'Name', defaultValue: 'Test' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} renderers={{ text: CustomTextRenderer }} />;
    }
    render(<Test />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.dataset.custom).toBe('text');
  });

  it('overrides multiple renderers simultaneously', () => {
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
    function CustomTextarea({ value, onChange, ...rest }: PrimitiveFieldRendererProps<string>) {
      return (
        <textarea
          {...rest}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-custom="textarea"
        />
      );
    }

    const schema = {
      name: textField({ label: 'Name' }),
      bio: textareaField({ label: 'Bio' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          renderers={{ text: CustomText, textarea: CustomTextarea }}
        />
      );
    }
    render(<Test />);
    const textbox = screen.getAllByRole('textbox');
    expect(textbox).toHaveLength(2);
    const textInput = textbox.find(
      (el) => el.tagName.toLowerCase() === 'input',
    )! as HTMLInputElement;
    const textareaEl = textbox.find(
      (el) => el.tagName.toLowerCase() === 'textarea',
    )! as HTMLTextAreaElement;
    expect(textInput.dataset.custom).toBe('text');
    expect(textareaEl.dataset.custom).toBe('textarea');
  });

  it('falls back to built-in renderers when only some are overridden', () => {
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
      return <FormRenderer form={form} schema={schema} renderers={{ text: CustomText }} />;
    }
    render(<Test />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    const textInput = inputs.find((i) => i.id === 'name')!;
    const emailInput = inputs.find((i) => i.id === 'email')!;
    expect(textInput.dataset.custom).toBe('text');
    expect(emailInput.dataset.custom).toBeUndefined();
    expect(emailInput.type).toBe('email');
  });

  it('overridden renderer receives and updates form state', () => {
    let lastValue = '';

    function CustomText({ value, onChange, ...rest }: PrimitiveFieldRendererProps<string>) {
      lastValue = value;
      return (
        <input {...rest} type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      );
    }

    const schema = { name: textField({ label: 'Name', defaultValue: 'Alice' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} renderers={{ text: CustomText }} />;
    }
    render(<Test />);
    expect(lastValue).toBe('Alice');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Bob' } });
    expect(lastValue).toBe('Bob');
  });
});

describe('FieldRenderer — renderer overrides', () => {
  it('accepts renderers prop and uses overrides', () => {
    function CustomText({ value, onChange, ...rest }: PrimitiveFieldRendererProps<string>) {
      return (
        <input
          {...rest}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-custom="fr"
        />
      );
    }

    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return (
        <FieldRenderer
          form={form}
          name="name"
          field={schema.name}
          renderers={{ text: CustomText }}
        />
      );
    }
    render(<Test />);
    expect((screen.getByRole('textbox') as HTMLInputElement).dataset.custom).toBe('fr');
  });
});

describe('Renderer overrides — type safety', () => {
  it('Renderers type contains built-in keys and custom', () => {
    type Keys = keyof Renderers;
    expectTypeOf<Keys>().toEqualTypeOf<
      | 'text'
      | 'textarea'
      | 'email'
      | 'phone'
      | 'number'
      | 'date'
      | 'checkbox'
      | 'radio'
      | 'select'
      | 'multi-select'
      | 'custom'
    >();
  });

  it('FormRendererProps includes optional renderers', () => {
    type TProps = FormRendererProps<{ name: ReturnType<typeof textField> }>;
    expectTypeOf<{ renderers?: Renderers }>().toMatchTypeOf<Pick<TProps, 'renderers'>>();
  });
});
