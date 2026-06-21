// @vitest-environment jsdom
import { describe, expect, it, expectTypeOf, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  useForm,
  textField,
  selectField,
  customField,
  required,
  FormRenderer,
  FieldRenderer,
} from '../../../src/index.js';
import type {
  FieldRendererProps,
  FieldRenderers,
  FormRendererProps,
  TextField,
  SelectField,
  CheckboxField,
  CustomField,
} from '../../../src/index.js';
import type { FormField } from '../../../src/types/field.js';

afterEach(() => {
  cleanup();
});

// ─── Helper Components ────────────────────────────────────────────────────────

function SimpleTextRenderer({ id, field, fieldState }: FieldRendererProps<string, TextField>) {
  return (
    <div>
      <label data-testid="fr-text-label" htmlFor={id}>
        {field.label}
      </label>
      <input
        id={id}
        type="text"
        value={fieldState.value}
        onChange={(e) => fieldState.setValue(e.target.value)}
        data-testid="fr-text-input"
      />
      {fieldState.touched && fieldState.errors.length > 0 && (
        <div data-testid="fr-text-errors">{fieldState.errors[0]}</div>
      )}
    </div>
  );
}

function SimpleSelectRenderer({ id, field, fieldState }: FieldRendererProps<string, SelectField>) {
  return (
    <div>
      <label data-testid="fr-select-label" htmlFor={id}>
        {field.label}
      </label>
      <select
        id={id}
        value={fieldState.value}
        onChange={(e) => fieldState.setValue(e.target.value)}
        data-testid="fr-select-input"
      >
        <option value="">Select...</option>
        {field.options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {fieldState.touched && fieldState.errors.length > 0 && (
        <div data-testid="fr-select-errors">{fieldState.errors[0]}</div>
      )}
    </div>
  );
}

function SimpleCheckboxRenderer({
  id,
  field,
  fieldState,
}: FieldRendererProps<boolean, CheckboxField>) {
  return (
    <div>
      <label data-testid="fr-checkbox-label" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={fieldState.value as boolean}
          onChange={(e) => fieldState.setValue(e.target.checked as never)}
          data-testid="fr-checkbox-input"
        />
        {field.label}
      </label>
      {fieldState.touched && fieldState.errors.length > 0 && (
        <div data-testid="fr-checkbox-errors">{fieldState.errors[0]}</div>
      )}
    </div>
  );
}

function RichTextFieldRenderer({ id, field, fieldState }: FieldRendererProps<string, CustomField>) {
  return (
    <div>
      <label data-testid="fr-custom-label" htmlFor={id}>
        {field.label}
      </label>
      <div
        data-testid="fr-custom-input"
        contentEditable
        onInput={(e) => fieldState.setValue((e.target as HTMLElement).textContent || '')}
      >
        {fieldState.value}
      </div>
      {fieldState.touched && fieldState.errors.length > 0 && (
        <div data-testid="fr-custom-errors">{fieldState.errors[0]}</div>
      )}
    </div>
  );
}

// ─── Field Renderer Resolution ───────────────────────────────────────────────

describe('FormRenderer — field renderer resolution', () => {
  it('fieldRenderers override built-in renderers', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer form={form} schema={schema} fieldRenderers={{ text: SimpleTextRenderer }} />
      );
    }
    render(<Test />);
    expect(screen.getByTestId('fr-text-input')).toBeTruthy();
    expect(screen.getByTestId('fr-text-label')).toBeTruthy();
    expect(screen.getByTestId('fr-text-label').textContent).toBe('Name');
  });

  it('fieldRenderers override renderers when both provided', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          renderers={{
            text: function OverriddenText() {
              return <input data-testid="should-not-render" />;
            },
          }}
          fieldRenderers={{ text: SimpleTextRenderer }}
        />
      );
    }
    render(<Test />);
    expect(screen.getByTestId('fr-text-input')).toBeTruthy();
    expect(screen.queryByTestId('should-not-render')).toBeNull();
  });

  it('fieldRenderers override renderers for select fields', () => {
    const schema = {
      category: selectField({
        label: 'Category',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          fieldRenderers={{ select: SimpleSelectRenderer }}
        />
      );
    }
    render(<Test />);
    expect(screen.getByTestId('fr-select-input')).toBeTruthy();
    expect(screen.getByTestId('fr-select-label')).toBeTruthy();
  });

  it('renderers still work when fieldRenderers is absent', () => {
    function CustomText({ value, onChange }: { value: string; onChange: (v: string) => void }) {
      return (
        <input data-testid="custom-text" value={value} onChange={(e) => onChange(e.target.value)} />
      );
    }
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} renderers={{ text: CustomText as never }} />;
    }
    render(<Test />);
    expect(screen.getByTestId('custom-text')).toBeTruthy();
  });

  it('fieldRenderers receives fieldState with value, errors, touched, dirty, setValue', () => {
    const schema = { name: textField({ label: 'Name', defaultValue: 'Alice' }) };
    let captured: FieldRendererProps<string, TextField> | null = null;

    function CaptureRenderer(props: FieldRendererProps<string, TextField>) {
      captured = props;
      return <div />;
    }

    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer form={form} schema={schema} fieldRenderers={{ text: CaptureRenderer }} />
      );
    }
    render(<Test />);
    expect(captured).not.toBeNull();
    expect(captured!.id).toBe('name');
    expect(captured!.name).toBe('name');
    expect(captured!.field.type).toBe('text');
    expect(captured!.fieldState.value).toBe('Alice');
    expect(Array.isArray(captured!.fieldState.errors)).toBe(true);
    expect(typeof captured!.fieldState.setValue).toBe('function');
  });

  it('fieldRenderers can update values through fieldState.setValue', () => {
    const schema = { name: textField({ label: 'Name', defaultValue: 'Alice' }) };
    function Test() {
      const form = useForm(schema);
      return (
        <div>
          <FormRenderer form={form} schema={schema} fieldRenderers={{ text: SimpleTextRenderer }} />
          <span data-testid="current-value">{form.getValue('name')}</span>
        </div>
      );
    }
    render(<Test />);
    expect(screen.getByTestId('current-value').textContent).toBe('Alice');
    fireEvent.change(screen.getByTestId('fr-text-input'), { target: { value: 'Bob' } });
    expect(screen.getByTestId('current-value').textContent).toBe('Bob');
  });

  it('fieldRenderers receives validation state (errors, touched)', () => {
    const schema = {
      name: textField({ label: 'Name', validators: [required()] }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <div>
          <FormRenderer form={form} schema={schema} fieldRenderers={{ text: SimpleTextRenderer }} />
          <button
            data-testid="validate"
            onClick={() => {
              form.markAllTouched();
              form.validate();
            }}
          >
            Validate
          </button>
        </div>
      );
    }
    render(<Test />);
    expect(screen.queryByTestId('fr-text-errors')).toBeNull();
    fireEvent.click(screen.getByTestId('validate'));
    expect(screen.getByTestId('fr-text-errors')).toBeTruthy();
    expect(screen.getByTestId('fr-text-errors').textContent).toBe('Field is required');
  });

  it('uses fieldRenderers when passed to FieldRenderer directly', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return (
        <FieldRenderer
          form={form}
          name="name"
          field={schema.name as FormField}
          fieldRenderers={{ text: SimpleTextRenderer }}
        />
      );
    }
    render(<Test />);
    expect(screen.getByTestId('fr-text-input')).toBeTruthy();
  });
});

// ─── Custom Field Renderers via fieldRenderers ───────────────────────────────

describe('FormRenderer — custom fieldRenderers', () => {
  it('fieldRenderers.custom overrides renderers.custom', () => {
    const schema = {
      bio: customField<string>({ component: 'richText', label: 'Biography' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          renderers={{
            custom: {
              richText: function ShouldNotRender() {
                return <div data-testid="wrong-renderer" />;
              },
            },
          }}
          fieldRenderers={{
            custom: {
              richText: RichTextFieldRenderer,
            },
          }}
        />
      );
    }
    render(<Test />);
    expect(screen.getByTestId('fr-custom-input')).toBeTruthy();
    expect(screen.getByTestId('fr-custom-label')).toBeTruthy();
    expect(screen.queryByTestId('wrong-renderer')).toBeNull();
  });

  it('fieldRenderers.custom renders complete field with label and errors', () => {
    const schema = {
      bio: customField<string>({
        component: 'richText',
        label: 'Biography',
        validators: [required()],
      }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <div>
          <FormRenderer
            form={form}
            schema={schema}
            fieldRenderers={{
              custom: {
                richText: RichTextFieldRenderer,
              },
            }}
          />
          <button
            data-testid="validate"
            onClick={() => {
              form.markAllTouched();
              form.validate();
            }}
          >
            Validate
          </button>
        </div>
      );
    }
    render(<Test />);
    expect(screen.getByTestId('fr-custom-label').textContent).toBe('Biography');
    expect(screen.getByTestId('fr-custom-input')).toBeTruthy();
    fireEvent.click(screen.getByTestId('validate'));
    expect(screen.getByTestId('fr-custom-errors')).toBeTruthy();
  });

  it('fieldRenderers.custom works alongside built-in fields', () => {
    const schema = {
      name: textField({ label: 'Name' }),
      bio: customField<string>({ component: 'richText', label: 'Biography' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          fieldRenderers={{
            text: SimpleTextRenderer,
            custom: {
              richText: RichTextFieldRenderer,
            },
          }}
        />
      );
    }
    render(<Test />);
    expect(screen.getByTestId('fr-text-input')).toBeTruthy();
    expect(screen.getByTestId('fr-custom-input')).toBeTruthy();
  });

  it('falls through to renderers.custom when fieldRenderers.custom has no match', () => {
    const schema = {
      bio: customField<string>({ component: 'richText', label: 'Biography' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          fieldRenderers={{
            custom: {},
          }}
          renderers={{
            custom: {
              richText: function CustomRichText({ value }: { value: string }) {
                return <div data-testid="custom-rich-text-fallback">{value}</div>;
              },
            },
          }}
        />
      );
    }
    render(<Test />);
    expect(screen.getByTestId('custom-rich-text-fallback')).toBeTruthy();
  });

  it('returns null when neither fieldRenderers.custom nor renderers.custom has a match', () => {
    const schema = {
      bio: customField<string>({ component: 'missingComponent', label: 'Bio' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          fieldRenderers={{
            custom: {},
          }}
        />
      );
    }
    render(<Test />);
    expect(screen.getByText('Bio')).toBeTruthy();
  });
});

// ─── FieldRenderer Standalone with fieldRenderers ────────────────────────────

describe('FieldRenderer — fieldRenderers', () => {
  it('renders with fieldRenderers prop directly', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return (
        <FieldRenderer
          form={form}
          name="name"
          field={schema.name as FormField}
          fieldRenderers={{ text: SimpleTextRenderer }}
        />
      );
    }
    render(<Test />);
    expect(screen.getByTestId('fr-text-input')).toBeTruthy();
  });

  it('renders custom field with fieldRenderers.custom directly', () => {
    const schema = {
      bio: customField<string>({ component: 'richText', label: 'Bio' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <FieldRenderer
          form={form}
          name="bio"
          field={schema.bio as FormField}
          fieldRenderers={{
            custom: {
              richText: RichTextFieldRenderer,
            },
          }}
        />
      );
    }
    render(<Test />);
    expect(screen.getByTestId('fr-custom-input')).toBeTruthy();
  });
});

// ─── Field Renderer Wrapper Tests ────────────────────────────────────────────
// When fieldRenderers is used, the field renderer owns all presentation.
// MakeForm must not wrap the output in mf-field or apply classNames.field.

describe('fieldRenderers — presentation ownership', () => {
  it('does not render mf-field wrapper when fieldRenderers is used', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer form={form} schema={schema} fieldRenderers={{ text: SimpleTextRenderer }} />
      );
    }
    render(<Test />);
    expect(screen.getByTestId('fr-text-input')).toBeTruthy();
    expect(screen.queryByTestId('fr-text-input')?.closest('.mf-field')).toBeNull();
  });

  it('still renders mf-field wrapper for default renderer path', () => {
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect(screen.getByText('Name')).toBeTruthy();
    const label = screen.getByText('Name');
    expect(label.closest('.mf-field')).toBeTruthy();
  });

  it('still renders mf-field wrapper when using renderers (not fieldRenderers)', () => {
    function CustomInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
      return (
        <input
          data-testid="custom-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
    const schema = { name: textField({ label: 'Name' }) };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer form={form} schema={schema} renderers={{ text: CustomInput as never }} />
      );
    }
    render(<Test />);
    expect(screen.getByTestId('custom-input').closest('.mf-field')).toBeTruthy();
  });
});

// ─── Type Tests ──────────────────────────────────────────────────────────────

describe('FieldRenderers — type safety', () => {
  it('FieldRenderers type contains built-in keys and custom', () => {
    type Keys = keyof FieldRenderers;
    expectTypeOf<Keys>().toEqualTypeOf<
      | 'text'
      | 'textarea'
      | 'email'
      | 'phone'
      | 'password'
      | 'number'
      | 'date'
      | 'checkbox'
      | 'radio'
      | 'select'
      | 'multi-select'
      | 'custom'
    >();
  });

  it('FieldRendererProps is properly typed for text fields', () => {
    expectTypeOf<FieldRendererProps<string, TextField>>().toMatchTypeOf<{
      id: string;
      name: string;
      field: { type: 'text'; label?: string; inputType?: string };
      fieldState: {
        value: string;
        errors: string[];
        touched: boolean;
        dirty: boolean;
        setValue: (value: string) => void;
      };
    }>();
  });

  it('FormRendererProps includes optional fieldRenderers', () => {
    type TProps = FormRendererProps<{ name: ReturnType<typeof textField> }>;
    expectTypeOf<{ fieldRenderers?: FieldRenderers }>().toMatchTypeOf<
      Pick<TProps, 'fieldRenderers'>
    >();
  });

  it('FieldRenderers keys match built-in field types', () => {
    const _fr: FieldRenderers = {
      text: SimpleTextRenderer,
      select: SimpleSelectRenderer,
      checkbox: SimpleCheckboxRenderer,
    };
    expect(_fr.text).toBe(SimpleTextRenderer);
    expect(_fr.select).toBe(SimpleSelectRenderer);
    expect(_fr.checkbox).toBe(SimpleCheckboxRenderer);
  });
});
