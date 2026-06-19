/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import type { FormInstance, FormState, Listener } from './types.js';
import type { InferValues } from '../types/inference.js';

function getDefaultValue(field: any): any {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }
  switch (field.type) {
    case 'text':
      return '';
    case 'number':
      return 0;
    case 'checkbox':
      return false;
    case 'select':
      return field.options?.[0]?.value ?? '';
    default:
      return undefined;
  }
}

export function createForm<TSchema extends Record<string, any>>(
  schema: TSchema
): FormInstance<TSchema> {
  type TValues = InferValues<TSchema>;

  const initialValues = {} as TValues;
  const touched = {} as Record<keyof TValues, boolean>;
  const dirty = {} as Record<keyof TValues, boolean>;

  for (const key of Object.keys(schema) as (keyof TSchema & string)[]) {
    const field = schema[key];
    initialValues[key] = getDefaultValue(field);
    touched[key] = false;
    dirty[key] = false;
  }

  const state: FormState<TValues> = {
    values: { ...initialValues },
    errors: {},
    touched,
    dirty,
  };

  const listeners = new Set<Listener<TValues>>();

  return {
    getValues() {
      return { ...state.values };
    },
    getValue(field) {
      return state.values[field];
    },
    setValue(field, value) {
      // Task 3
    },
    validate() {
      // Task 6
      return { valid: true, errors: {} };
    },
    reset() {
      // Task 5
    },
    subscribe(listener) {
      // Task 4
      return () => {};
    },
    unsubscribe(listener) {
      // Task 4
    },
  };
}
