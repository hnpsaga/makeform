import React from 'react';
import { useField } from '../useField.js';
import type { FieldRendererProps } from './types.js';
import type { RadioField, SelectField, MultiSelectField } from '../../types/field.js';
import { TextRenderer } from './renderers/text.js';
import { TextareaRenderer } from './renderers/textarea.js';
import { EmailRenderer } from './renderers/email.js';
import { PhoneRenderer } from './renderers/phone.js';
import { NumberRenderer } from './renderers/number.js';
import { DateRenderer } from './renderers/date.js';
import { CheckboxRenderer } from './renderers/checkbox.js';
import { RadioRenderer } from './renderers/radio.js';
import { SelectRenderer } from './renderers/select.js';
import { MultiSelectRenderer } from './renderers/multiSelect.js';

function getLabelText(fieldLabel: string | undefined, name: string): string {
  return fieldLabel ?? name;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FieldRenderer<
  TSchema extends Record<string, any>,
  K extends keyof TSchema & string,
>({ form, name, field }: FieldRendererProps<TSchema, K>) {
  const fieldState = useField(form, name);
  const id = name;
  const labelText = getLabelText(field.label, name);
  const hasErrors = fieldState.errors.length > 0;

  function renderInput() {
    switch (field.type) {
      case 'text':
        return (
          <TextRenderer
            id={id}
            name={name}
            value={fieldState.value as string}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      case 'textarea':
        return (
          <TextareaRenderer
            id={id}
            name={name}
            value={fieldState.value as string}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      case 'email':
        return (
          <EmailRenderer
            id={id}
            name={name}
            value={fieldState.value as string}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      case 'phone':
        return (
          <PhoneRenderer
            id={id}
            name={name}
            value={fieldState.value as string}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      case 'number':
        return (
          <NumberRenderer
            id={id}
            name={name}
            value={fieldState.value as number}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      case 'date':
        return (
          <DateRenderer
            id={id}
            name={name}
            value={fieldState.value as Date}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      case 'checkbox':
        return (
          <CheckboxRenderer
            id={id}
            name={name}
            checked={fieldState.value as boolean}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      case 'radio': {
        const radioField = field as RadioField;
        return (
          <RadioRenderer
            id={id}
            name={name}
            value={fieldState.value as string}
            options={radioField.options}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      }
      case 'select': {
        const selectField = field as SelectField;
        return (
          <SelectRenderer
            id={id}
            name={name}
            value={fieldState.value as string}
            options={selectField.options}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      }
      case 'multi-select': {
        const msField = field as MultiSelectField;
        return (
          <MultiSelectRenderer
            id={id}
            name={name}
            value={fieldState.value as string[]}
            options={msField.options}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      }
      default:
        return null;
    }
  }

  return (
    <div className="mf-field" data-field={name}>
      <label className="mf-label" htmlFor={id}>
        {labelText}
      </label>
      {renderInput()}
      {hasErrors && (
        <div className="mf-error" role="alert">
          {fieldState.errors.map((error) => (
            <span className="mf-error__text" key={error}>
              {error}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
