import {
  useForm,
  FormRenderer,
  textField,
  textareaField,
  phoneField,
  dateField,
  selectField,
} from '@hnpsaga/makeform';

const schema = {
  displayName: textField({
    label: 'Display Name',
  }),

  biography: textareaField({
    label: 'Biography',
  }),

  phoneNumber: phoneField({
    label: 'Phone Number',
  }),

  birthDate: dateField({
    label: 'Birth Date',
  }),

  country: selectField({
    label: 'Country',
    options: [
      { label: 'United States', value: 'us' },
      { label: 'Canada', value: 'ca' },
      { label: 'United Kingdom', value: 'uk' },
      { label: 'Germany', value: 'de' },
      { label: 'India', value: 'in' },
    ],
  }),
};

export default function ProfileForm() {
  const form = useForm(schema);
  const state = form.getState();

  return (
    <div>
      <h1>Profile Form</h1>

      <FormRenderer form={form} schema={schema} />

      <div style={{ marginTop: '1rem' }}>
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

      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f3f4f6',
          borderRadius: '0.375rem',
        }}
      >
        <h3>Current Form Values</h3>
        <pre
          style={{ margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {JSON.stringify(state.values, null, 2)}
        </pre>
      </div>
    </div>
  );
}
