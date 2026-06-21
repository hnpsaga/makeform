import {
  useForm,
  FormRenderer,
  textField,
  numberField,
  required,
  min,
  max,
  pattern,
  custom,
} from '@hnpsaga/makeform';
import type { InferValues } from '@hnpsaga/makeform';

const schema = {
  requiredField: textField({
    label: 'Required Field',
    validators: [required()],
  }),

  minLengthField: textField({
    label: 'Min Length (3)',
    validators: [min(3)],
  }),

  maxLengthField: textField({
    label: 'Max Length (10)',
    validators: [max(10)],
  }),

  patternField: textField({
    label: 'Alphanumeric Only',
    validators: [pattern(/^[a-zA-Z0-9]+$/, 'Must be alphanumeric')],
  }),

  minValueField: numberField({
    label: 'Min Value (18)',
    validators: [min(18)],
  }),

  maxValueField: numberField({
    label: 'Max Value (100)',
    validators: [max(100)],
  }),

  customField: textField({
    label: 'Must Contain "demo"',
    validators: [
      custom<string>((value) => {
        if (value && !value.toLowerCase().includes('demo')) {
          return 'Value must contain "demo"';
        }
        return null;
      }),
    ],
  }),
};

export default function ValidationDemo() {
  const form = useForm(schema);
  const state = form.getState();

  return (
    <div>
      <h1>Validation Showcase</h1>
      <p>Try submitting or interacting with each field to see validation results.</p>

      <FormRenderer form={form} schema={schema} />

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => {
            form.markAllTouched();
            form.validate();
          }}
          style={{
            padding: '0.5rem 1.5rem',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Validate
        </button>
        <button
          onClick={() => form.reset()}
          style={{
            padding: '0.5rem 1.5rem',
            background: '#6b7280',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h3>Validation Results</h3>
        {Object.entries(state.errors).map(([field, errors]) =>
          errors.length > 0 ? (
            <div key={field} style={{ marginBottom: '0.5rem' }}>
              <strong>{field}:</strong> {errors.join(', ')}
            </div>
          ) : null,
        )}
        {Object.values(state.errors).every((e) => e.length === 0) && <p>No validation errors.</p>}
      </div>
    </div>
  );
}
