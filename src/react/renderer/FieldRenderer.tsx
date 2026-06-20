import React from 'react';
import { useField } from '../useField.js';
import type { FieldRendererProps } from './types.js';
import type { RadioField, SelectField, MultiSelectField } from '../../types/field.js';
import { builtInRenderers } from './registry.js';

function getLabelText(fieldLabel: string | undefined, name: string): string {
  return fieldLabel ?? name;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FieldRenderer<
  TSchema extends Record<string, any>,
  K extends keyof TSchema & string,
>({ form, name, field, renderers }: FieldRendererProps<TSchema, K>) {
  const fieldState = useField(form, name);
  const id = name;
  const labelText = getLabelText(field.label, name);
  const hasErrors = fieldState.errors.length > 0;

  function renderInput() {
    switch (field.type) {
      case 'text': {
        const TextRenderer = renderers?.text ?? builtInRenderers.text;
        return (
          <TextRenderer
            id={id}
            name={name}
            value={fieldState.value as string}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      }
      case 'textarea': {
        const TextareaRenderer = renderers?.textarea ?? builtInRenderers.textarea;
        return (
          <TextareaRenderer
            id={id}
            name={name}
            value={fieldState.value as string}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      }
      case 'email': {
        const EmailRenderer = renderers?.email ?? builtInRenderers.email;
        return (
          <EmailRenderer
            id={id}
            name={name}
            value={fieldState.value as string}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      }
      case 'phone': {
        const PhoneRenderer = renderers?.phone ?? builtInRenderers.phone;
        return (
          <PhoneRenderer
            id={id}
            name={name}
            value={fieldState.value as string}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      }
      case 'number': {
        const NumberRenderer = renderers?.number ?? builtInRenderers.number;
        return (
          <NumberRenderer
            id={id}
            name={name}
            value={fieldState.value as number}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      }
      case 'date': {
        const DateRenderer = renderers?.date ?? builtInRenderers.date;
        return (
          <DateRenderer
            id={id}
            name={name}
            value={fieldState.value as Date}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      }
      case 'checkbox': {
        const CheckboxRenderer = renderers?.checkbox ?? builtInRenderers.checkbox;
        return (
          <CheckboxRenderer
            id={id}
            name={name}
            checked={fieldState.value as boolean}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      }
      case 'radio': {
        const radioField = field as RadioField;
        const RadioRenderer = renderers?.radio ?? builtInRenderers.radio;
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
        const SelectRenderer = renderers?.select ?? builtInRenderers.select;
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
        const MSRenderer = renderers?.['multi-select'] ?? builtInRenderers['multi-select'];
        return (
          <MSRenderer
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
