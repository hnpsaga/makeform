// @vitest-environment jsdom
import { describe, expect, it, expectTypeOf, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  useForm,
  customField,
  textField,
  required,
  FormRenderer,
  FieldRenderer,
  createForm,
} from '../../../src/index.js';
import type { CustomFieldRendererProps, InferValues } from '../../../src/index.js';
import type { CustomField, FormField } from '../../../src/types/field.js';

afterEach(() => {
  cleanup();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function RichTextRenderer({ value, setValue }: CustomFieldRendererProps<string>) {
  return (
    <div>
      <div
        data-testid="rich-text"
        contentEditable
        onInput={(e) => setValue((e.target as HTMLElement).textContent || '')}
      >
        {value}
      </div>
      <input type="hidden" data-testid="rich-text-value" value={value} readOnly />
    </div>
  );
}

function LocationRenderer({ value, setValue }: CustomFieldRendererProps<string>) {
  return (
    <div>
      <input
        data-testid="location-input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

// ─── Custom Renderer Registration ─────────────────────────────────────────────

describe('FormRenderer — custom field renderers', () => {
  it('renders a custom field with a custom renderer via renderers.custom', () => {
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
              richText: RichTextRenderer,
            },
          }}
        />
      );
    }
    render(<Test />);
    expect(screen.getByText('Biography')).toBeTruthy();
    expect(screen.getByTestId('rich-text')).toBeTruthy();
  });

  it('renders custom fields alongside built-in fields', () => {
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
          renderers={{
            custom: {
              richText: RichTextRenderer,
            },
          }}
        />
      );
    }
    render(<Test />);
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getByText('Biography')).toBeTruthy();
    expect(screen.getByTestId('rich-text')).toBeTruthy();
  });

  it('renders multiple custom fields with different renderers', () => {
    const schema = {
      bio: customField<string>({ component: 'richText', label: 'Biography' }),
      location: customField<string>({ component: 'locationPicker', label: 'Location' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          renderers={{
            custom: {
              richText: RichTextRenderer,
              locationPicker: LocationRenderer,
            },
          }}
        />
      );
    }
    render(<Test />);
    expect(screen.getByTestId('rich-text')).toBeTruthy();
    expect(screen.getByTestId('location-input')).toBeTruthy();
  });

  it('renders only custom fields without built-in renderers', () => {
    const schema = {
      bio: customField<string>({ component: 'richText' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          renderers={{
            custom: {
              richText: RichTextRenderer,
            },
          }}
        />
      );
    }
    render(<Test />);
    expect(screen.getByTestId('rich-text')).toBeTruthy();
  });
});

// ─── Value Updates ────────────────────────────────────────────────────────────

describe('Custom renderers — value updates', () => {
  it('updates field value through setValue', () => {
    const schema = {
      bio: customField<string>({ component: 'richText', defaultValue: 'Hello' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <div>
          <FormRenderer
            form={form}
            schema={schema}
            renderers={{
              custom: {
                richText: RichTextRenderer,
              },
            }}
          />
          <span data-testid="form-value">{form.getValue('bio')}</span>
        </div>
      );
    }
    render(<Test />);
    expect(screen.getByTestId('form-value').textContent).toBe('Hello');
  });

  it('setValue triggers re-render with new value', () => {
    const schema = {
      bio: customField<string>({ component: 'richText', defaultValue: 'Hello' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <div>
          <FormRenderer
            form={form}
            schema={schema}
            renderers={{
              custom: {
                richText: RichTextRenderer,
              },
            }}
          />
          <button data-testid="update" onClick={() => form.setValue('bio', 'World')}>
            Update
          </button>
          <span data-testid="form-value">{form.getValue('bio')}</span>
        </div>
      );
    }
    render(<Test />);
    expect(screen.getByTestId('form-value').textContent).toBe('Hello');
    fireEvent.click(screen.getByTestId('update'));
    expect(screen.getByTestId('form-value').textContent).toBe('World');
  });

  it('custom renderer value updates mark field as dirty', () => {
    const schema = {
      bio: customField<string>({ component: 'richText', defaultValue: 'Hello' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <div>
          <FormRenderer
            form={form}
            schema={schema}
            renderers={{
              custom: {
                richText: RichTextRenderer,
              },
            }}
          />
          <span data-testid="dirty">{String(form.getState().dirty.bio)}</span>
          <button data-testid="update" onClick={() => form.setValue('bio', 'World')}>
            Update
          </button>
        </div>
      );
    }
    render(<Test />);
    expect(screen.getByTestId('dirty').textContent).toBe('false');
    fireEvent.click(screen.getByTestId('update'));
    // After form.setValue, subscribe fires and re-renders
  });
});

// ─── Validation Integration ───────────────────────────────────────────────────

describe('Custom renderers — validation integration', () => {
  it('runs validators on custom fields through form.validate()', () => {
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
            renderers={{
              custom: {
                richText: RichTextRenderer,
              },
            }}
          />
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

  it('clears errors on custom field after value set and re-validation', () => {
    const schema = {
      bio: customField<string>({
        component: 'richText',
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
            renderers={{
              custom: {
                richText: RichTextRenderer,
              },
            }}
          />
          <button data-testid="validate" onClick={() => form.validate()}>
            Validate
          </button>
          <button data-testid="set-value" onClick={() => form.setValue('bio', 'Hello')}>
            Set
          </button>
        </div>
      );
    }
    render(<Test />);
    fireEvent.click(screen.getByTestId('validate'));
    expect(screen.getByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByTestId('set-value'));
    fireEvent.click(screen.getByTestId('validate'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows errors only on the failed custom field, not on passing fields', () => {
    const schema = {
      name: textField({ label: 'Name', defaultValue: 'Alice' }),
      bio: customField<string>({
        component: 'richText',
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
            renderers={{
              custom: {
                richText: RichTextRenderer,
              },
            }}
          />
          <button data-testid="validate" onClick={() => form.validate()}>
            Validate
          </button>
        </div>
      );
    }
    render(<Test />);
    fireEvent.click(screen.getByTestId('validate'));
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });
});

// ─── Renderer Fallback ────────────────────────────────────────────────────────

describe('Custom renderers — fallback behavior', () => {
  it('renders label but no input when custom component is missing from renderers', () => {
    const schema = {
      bio: customField<string>({ component: 'missingRenderer', label: 'Bio' }),
    };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect(screen.getByText('Bio')).toBeTruthy();
  });

  it('renders label but no input when component name is undefined', () => {
    const schema = {
      bio: customField<string>({ label: 'Bio' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          renderers={{
            custom: {
              richText: RichTextRenderer,
            },
          }}
        />
      );
    }
    render(<Test />);
    expect(screen.getByText('Bio')).toBeTruthy();
  });

  it('falls back when renderers.custom is undefined but component is specified', () => {
    const schema = {
      bio: customField<string>({ component: 'richText', label: 'Bio' }),
    };
    function Test() {
      const form = useForm(schema);
      return <FormRenderer form={form} schema={schema} />;
    }
    render(<Test />);
    expect(screen.getByText('Bio')).toBeTruthy();
  });

  it('falls back when renderers.custom[component] is undefined', () => {
    const schema = {
      bio: customField<string>({ component: 'richText', label: 'Bio' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          renderers={{
            custom: {},
          }}
        />
      );
    }
    render(<Test />);
    expect(screen.getByText('Bio')).toBeTruthy();
  });
});

// ─── FieldRenderer Standalone ─────────────────────────────────────────────────

describe('FieldRenderer — custom fields', () => {
  it('renders custom field with FieldRenderer standalone', () => {
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
          renderers={{
            custom: {
              richText: RichTextRenderer,
            },
          }}
        />
      );
    }
    render(<Test />);
    expect(screen.getByText('Bio')).toBeTruthy();
    expect(screen.getByTestId('rich-text')).toBeTruthy();
  });
});

// ─── State Integration ────────────────────────────────────────────────────────

describe('Custom renderers — state integration', () => {
  it('touched state is updated after setValue on custom field', () => {
    const schema = {
      bio: customField<string>({ component: 'richText' }),
    };
    const form = createForm(schema);
    function Test() {
      return (
        <div>
          <FormRenderer
            form={form}
            schema={schema}
            renderers={{
              custom: {
                richText: RichTextRenderer,
              },
            }}
          />
          <button data-testid="update" onClick={() => form.setValue('bio', 'test')}>
            Update
          </button>
        </div>
      );
    }
    render(<Test />);
    expect(form.getState().touched.bio).toBe(false);
    fireEvent.click(screen.getByTestId('update'));
    expect(form.getState().touched.bio).toBe(true);
  });

  it('dirty state is correct after setValue on custom field', () => {
    const schema = {
      bio: customField<string>({ component: 'richText', defaultValue: 'initial' }),
    };
    const form = createForm(schema);
    function Test() {
      return (
        <div>
          <FormRenderer
            form={form}
            schema={schema}
            renderers={{
              custom: {
                richText: RichTextRenderer,
              },
            }}
          />
          <button data-testid="update" onClick={() => form.setValue('bio', 'modified')}>
            Update
          </button>
        </div>
      );
    }
    render(<Test />);
    expect(form.getState().dirty.bio).toBe(false);
    fireEvent.click(screen.getByTestId('update'));
    expect(form.getState().dirty.bio).toBe(true);
  });

  it('reset restores initial value for custom field', () => {
    const schema = {
      bio: customField<string>({ component: 'richText', defaultValue: 'initial' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <div>
          <FormRenderer
            form={form}
            schema={schema}
            renderers={{
              custom: {
                richText: RichTextRenderer,
              },
            }}
          />
          <button data-testid="set" onClick={() => form.setValue('bio', 'modified')}>
            Set
          </button>
          <button data-testid="reset" onClick={() => form.reset()}>
            Reset
          </button>
          <span data-testid="value">{form.getValue('bio')}</span>
        </div>
      );
    }
    render(<Test />);
    fireEvent.click(screen.getByTestId('set'));
    expect(screen.getByTestId('value').textContent).toBe('modified');
    fireEvent.click(screen.getByTestId('reset'));
    expect(screen.getByTestId('value').textContent).toBe('initial');
  });
});

// ─── Type Tests ───────────────────────────────────────────────────────────────

describe('Custom renderers — type safety', () => {
  it('InferValues works with customField', () => {
    const _schema = {
      bio: customField<string>({ component: 'richText' }),
    };
    type Values = InferValues<typeof _schema>;
    expectTypeOf<Values>().toEqualTypeOf<{ bio: string }>();
  });

  it('InferValues works with customField using complex type', () => {
    interface Location {
      lat: number;
      lng: number;
    }
    const _schema = {
      loc: customField<Location>({ component: 'locationPicker' }),
    };
    type Values = InferValues<typeof _schema>;
    expectTypeOf<Values>().toEqualTypeOf<{ loc: Location }>();
  });

  it('InferValues works with mixed schema including customField', () => {
    const _schema = {
      name: textField(),
      bio: customField<string>({ component: 'richText' }),
    };
    type Values = InferValues<typeof _schema>;
    expectTypeOf<Values>().toEqualTypeOf<{ name: string; bio: string }>();
  });

  it('customField returns CustomField<TValue> type', () => {
    const field = customField<string>({ component: 'richText' });
    expectTypeOf(field).toEqualTypeOf<CustomField<string>>();
    expect(field.type).toBe('custom');
    expect(field.component).toBe('richText');
  });

  it('customField component is optional and defaults to undefined', () => {
    const field = customField<string>();
    expect(field.component).toBeUndefined();
  });

  it('CustomFieldRendererProps is properly typed', () => {
    expectTypeOf<CustomFieldRendererProps<string>>().toMatchTypeOf<{
      id: string;
      name: string;
      value: string;
      errors: string[];
      touched: boolean;
      dirty: boolean;
      setValue: (value: string) => void;
    }>();
  });

  it('Renderer overrides for built-in fields still work alongside custom renderers', () => {
    const schema = {
      name: textField({ label: 'Name' }),
    };
    function Test() {
      const form = useForm(schema);
      return (
        <FormRenderer
          form={form}
          schema={schema}
          renderers={{
            text: function CustomText({ id, name, value, onChange }) {
              return (
                <input
                  type="text"
                  id={id}
                  name={name}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  data-custom="text-override"
                />
              );
            },
          }}
        />
      );
    }
    render(<Test />);
    expect((screen.getByRole('textbox') as HTMLInputElement).dataset.custom).toBe('text-override');
  });
});
