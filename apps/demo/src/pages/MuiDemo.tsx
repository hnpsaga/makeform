import {
  useForm,
  FormRenderer,
  textField,
  selectField,
  checkboxField,
  required,
} from '@hnpsaga/makeform';
import type {
  FieldRendererProps,
  FieldRenderers,
  TextField,
  SelectField,
  CheckboxField,
} from '@hnpsaga/makeform';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';

const schema = {
  name: textField({
    label: 'Full Name',
    validators: [required()],
  }),
  country: selectField({
    label: 'Country',
    options: [
      { label: 'United States', value: 'us' },
      { label: 'Canada', value: 'ca' },
      { label: 'United Kingdom', value: 'uk' },
      { label: 'India', value: 'in' },
    ],
  }),
  acceptTerms: checkboxField({
    label: 'I accept the terms and conditions',
    validators: [required()],
  }),
};

function MuiTextRenderer({ field, fieldState }: FieldRendererProps<string, TextField>) {
  return (
    <TextField
      label={field.label}
      value={fieldState.value}
      onChange={(e) => fieldState.setValue(e.target.value)}
      error={fieldState.touched && fieldState.errors.length > 0}
      helperText={fieldState.touched ? fieldState.errors[0] : undefined}
      variant="outlined"
      size="small"
      fullWidth
    />
  );
}

function MuiSelectRenderer({ field, fieldState }: FieldRendererProps<string, SelectField>) {
  return (
    <FormControl fullWidth size="small" error={fieldState.touched && fieldState.errors.length > 0}>
      <InputLabel>{field.label}</InputLabel>
      <Select
        value={fieldState.value}
        label={field.label}
        onChange={(e) => fieldState.setValue(e.target.value)}
      >
        {field.options.map((opt) => (
          <MenuItem key={String(opt.value)} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {fieldState.touched && fieldState.errors.length > 0 && (
        <FormHelperText>{fieldState.errors[0]}</FormHelperText>
      )}
    </FormControl>
  );
}

function MuiCheckboxRenderer({ field, fieldState }: FieldRendererProps<boolean, CheckboxField>) {
  return (
    <FormControl error={fieldState.touched && fieldState.errors.length > 0}>
      <FormControlLabel
        control={
          <Checkbox
            checked={fieldState.value}
            onChange={(e) => fieldState.setValue(e.target.checked)}
          />
        }
        label={field.label}
      />
      {fieldState.touched && fieldState.errors.length > 0 && (
        <FormHelperText>{fieldState.errors[0]}</FormHelperText>
      )}
    </FormControl>
  );
}

const fieldRenderers: FieldRenderers = {
  text: MuiTextRenderer,
  select: MuiSelectRenderer,
  checkbox: MuiCheckboxRenderer,
};

export default function MuiDemo() {
  const form = useForm(schema);

  const handleSubmit = form.handleSubmit((values) => {
    alert(JSON.stringify(values, null, 2));
  });

  return (
    <div>
      <h1>Material UI Integration</h1>
      <p>
        MakeForm works with third-party UI libraries through <strong>fieldRenderers</strong> —
        complete field-level overrides that replace the entire field presentation. Material UI owns
        the label, input, helper text, and error state. MakeForm provides the field schema and state
        management.
      </p>

      <section
        style={{
          maxWidth: '32rem',
          padding: '1.5rem',
          border: '1px solid #e0e0e0',
          borderRadius: '0.5rem',
        }}
      >
        <FormRenderer form={form} schema={schema} fieldRenderers={fieldRenderers} />

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleSubmit}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Submit
          </button>
          <button
            onClick={() => form.reset()}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
      </section>

      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f3f4f6',
          borderRadius: '0.375rem',
        }}
      >
        <h3>Current Form State</h3>
        <pre
          style={{ margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {JSON.stringify(form.getState(), null, 2)}
        </pre>
      </div>
    </div>
  );
}
