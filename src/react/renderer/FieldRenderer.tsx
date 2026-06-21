import React from 'react';
import { useField } from '../useField.js';
import type { FieldRendererProps } from './types.js';
import type {
  RadioField,
  SelectField,
  MultiSelectField,
  CustomField,
  TextField,
} from '../../types/field.js';
import { builtInRenderers } from './registry.js';

function getLabelText(fieldLabel: string | undefined, name: string): string {
  return fieldLabel ?? name;
}

export function FieldRenderer<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchema extends Record<string, any>,
  K extends keyof TSchema & string,
>({ form, name, field, renderers, classNames }: FieldRendererProps<TSchema, K>) {
  const fieldState = useField(form, name);
  const id = name;
  const labelText = getLabelText(field.label, name);
  const hasErrors = fieldState.errors.length > 0;

  function mergeClasses(...classes: (string | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
  }

  function renderInput() {
    switch (field.type) {
      case 'text': {
        const textField = field as TextField;
        const TextRenderer = renderers?.text ?? builtInRenderers.text;
        return (
          <TextRenderer
            id={id}
            name={name}
            value={fieldState.value as string}
            onChange={(v) => fieldState.setValue(v as typeof fieldState.value)}
            className={classNames?.input}
            inputType={textField.inputType}
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
            className={classNames?.textarea}
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
            className={classNames?.input}
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
            className={classNames?.input}
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
            className={classNames?.input}
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
            className={classNames?.input}
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
            className={classNames?.checkbox}
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
            className={classNames?.radio}
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
            className={classNames?.select}
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
            className={classNames?.select}
          />
        );
      }
      case 'custom': {
        const customField = field as CustomField;
        const componentName = customField.component;
        if (!componentName) return null;
        const customRenderers = renderers?.custom;
        const CustomRenderer = customRenderers?.[componentName];
        if (!CustomRenderer) return null;
        return (
          <CustomRenderer
            id={id}
            name={name}
            value={fieldState.value}
            errors={fieldState.errors}
            touched={fieldState.touched}
            dirty={fieldState.dirty}
            setValue={(v) => fieldState.setValue(v)}
          />
        );
      }
      default:
        return null;
    }
  }

  const isCheckbox = field.type === 'checkbox';

  return (
    <div
      className={mergeClasses('mf-field', isCheckbox ? 'mf-field-checkbox' : '', classNames?.field)}
      data-field={name}
    >
      {isCheckbox ? (
        <label
          className={mergeClasses('mf-label', 'mf-label-checkbox', classNames?.label)}
          htmlFor={id}
        >
          {renderInput()}
          {labelText}
        </label>
      ) : (
        <label className={mergeClasses('mf-label', classNames?.label)} htmlFor={id}>
          {labelText}
        </label>
      )}
      {!isCheckbox && renderInput()}
      {hasErrors && (
        <div className={mergeClasses('mf-error', classNames?.error)} role="alert">
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
