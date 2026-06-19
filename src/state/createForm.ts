/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance, FormState, Listener } from './types.js';
import type { InferValues } from '../types/inference.js';

function getDefaultValue(field: any): any {
  if (!field) return undefined;
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
      const prevVal = state.values[field];
      const prevTouched = state.touched[field];
      const prevDirty = state.dirty[field];

      const nextVal = value;
      const nextTouched = true;
      const nextDirty = value !== initialValues[field];

      if (prevVal !== nextVal || prevTouched !== nextTouched || prevDirty !== nextDirty) {
        state.values[field] = nextVal;
        state.touched[field] = nextTouched;
        state.dirty[field] = nextDirty;

        listeners.forEach(l => l({
          values: { ...state.values },
          errors: { ...state.errors },
          touched: { ...state.touched },
          dirty: { ...state.dirty },
        }));
      }
    },
    validate() {
      // Task 6
      return { valid: true, errors: {} };
    },
    reset() {
      state.values = { ...initialValues };
      state.errors = {};
      for (const key of Object.keys(schema) as (keyof TValues & string)[]) {
        state.touched[key] = false;
        state.dirty[key] = false;
      }
      listeners.forEach(l => l({
        values: { ...state.values },
        errors: { ...state.errors },
        touched: { ...state.touched },
        dirty: { ...state.dirty },
      }));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    unsubscribe(listener) {
      listeners.delete(listener);
    },
  };
}
