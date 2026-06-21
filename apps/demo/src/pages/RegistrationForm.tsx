import { useState } from 'react';
import {
  useForm,
  FormRenderer,
  textField,
  emailField,
  passwordField,
  checkboxField,
  required,
  email,
  min,
} from '@hnpsaga/makeform';

const schema = {
  fullName: textField({
    label: 'Full Name',
    validators: [required()],
  }),

  emailAddress: emailField({
    label: 'Email Address',
    validators: [required(), email()],
  }),

  password: passwordField({
    label: 'Password',
    validators: [required(), min(8)],
  }),

  acceptTerms: checkboxField({
    label: 'I accept the terms and conditions',
    validators: [required()],
  }),
};

export default function RegistrationForm() {
  const form = useForm(schema);
  const [submittedValues, setSubmittedValues] = useState<Record<string, unknown> | null>(null);

  const handleSubmit = form.handleSubmit((values) => {
    setSubmittedValues(values);
  });

  return (
    <div>
      <h1>Registration Form</h1>

      <FormRenderer form={form} schema={schema} />

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleSubmit}
          style={{
            padding: '0.5rem 1.5rem',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
        <button
          onClick={() => {
            form.reset();
            setSubmittedValues(null);
          }}
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

      {submittedValues && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f3f4f6',
            borderRadius: '0.375rem',
          }}
        >
          <h3>Submitted Values</h3>
          <pre
            style={{
              margin: 0,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {JSON.stringify(submittedValues, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
