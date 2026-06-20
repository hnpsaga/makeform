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
>({ form, name, field }: FieldRendererProps<TSchema, K>) {
  const fieldState = useField(form, name);
  const id = name;
  const labelText = getLabelText(field.label, name);
  const hasErrors = fieldState.errors.length > 0;

  function renderInput() {
    switch (field.type) {
      case 'text':
        return (
          <builtInRenderers.text
            id={id}
            name={name}
            value={fieldState.value as string}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      case 'textarea':
        return (
          <builtInRenderers.textarea
            id={id}
            name={name}
            value={fieldState.value as string}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      case 'email':
        return (
          <builtInRenderers.email
            id={id}
            name={name}
            value={fieldState.value as string}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      case 'phone':
        return (
          <builtInRenderers.phone
            id={id}
            name={name}
            value={fieldState.value as string}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      case 'number':
        return (
          <builtInRenderers.number
            id={id}
            name={name}
            value={fieldState.value as number}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      case 'date':
        return (
          <builtInRenderers.date
            id={id}
            name={name}
            value={fieldState.value as Date}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      case 'checkbox':
        return (
          <builtInRenderers.checkbox
            id={id}
            name={name}
            checked={fieldState.value as boolean}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
          />
        );
      case 'radio': {
        const radioField = field as RadioField;
        return (
          <builtInRenderers.radio
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
          <builtInRenderers.select
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
        const MSRenderer = builtInRenderers['multi-select'];
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
