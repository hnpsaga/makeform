import type { FormInstance, FormState, Listener } from './types.js';
import type { InferValues } from '../types/inference.js';
import { validateForm } from '../validation/validateForm.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

function errorsChanged(a: Record<string, string[]>, b: Record<string, string[]>): boolean {
  if (a === b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return true;
  for (const key of keysA) {
    if (!(key in b)) return true;
    const errA = a[key] || [];
    const errB = b[key] || [];
    if (errA.length !== errB.length) return true;
    for (let i = 0; i < errA.length; i++) {
      if (errA[i] !== errB[i]) return true;
    }
  }
  return false;
}

function freezeErrors(errors: Record<string, string[]>): Record<string, string[]> {
  if (
    Object.isFrozen(errors) &&
    Object.values(errors).every((errorList) => Object.isFrozen(errorList))
  ) {
    return errors;
  }

  const frozenErrors: Record<string, string[]> = {};
  for (const key of Object.keys(errors)) {
    frozenErrors[key] = Object.freeze([...(errors[key] || [])]) as string[];
  }
  return Object.freeze(frozenErrors);
}

function createState<TValues>(
  values: TValues,
  errors: Record<string, string[]>,
  touched: Record<keyof TValues, boolean>,
  dirty: Record<keyof TValues, boolean>,
): FormState<TValues> {
  return Object.freeze({
    values: Object.freeze(values),
    errors: freezeErrors(errors),
    touched: Object.freeze(touched),
    dirty: Object.freeze(dirty),
  }) as FormState<TValues>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createForm<TSchema extends Record<string, any>>(
  schema: TSchema,
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

  let state: FormState<TValues> = createState<TValues>({ ...initialValues }, {}, touched, dirty);

  const listeners = new Set<Listener<TValues>>();

  const notify = () => {
    Array.from(listeners).forEach((l) => l(state));
  };

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
        state = createState<TValues>(
          { ...state.values, [field]: nextVal },
          state.errors,
          { ...state.touched, [field]: nextTouched },
          { ...state.dirty, [field]: nextDirty },
        );

        notify();
      }
    },
    validate() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = validateForm(schema as any, state.values as any);
      const changed = errorsChanged(state.errors, result.errors);
      if (changed) {
        state = createState<TValues>(state.values, result.errors, state.touched, state.dirty);
        notify();
      }
      return result;
    },
    reset() {
      const nextTouched = {} as Record<keyof TValues, boolean>;
      const nextDirty = {} as Record<keyof TValues, boolean>;
      for (const key of Object.keys(schema) as (keyof TValues & string)[]) {
        nextTouched[key] = false;
        nextDirty[key] = false;
      }
      state = createState<TValues>({ ...initialValues }, {}, nextTouched, nextDirty);
      notify();
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
    getState() {
      return state;
    },
  };
}
