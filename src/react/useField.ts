import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import type { FormInstance } from '../state/types.js';
import type { InferValues } from '../types/inference.js';
import type { FieldState } from './types.js';

function isFieldStateEqual(
  prevVal: unknown,
  prevErrors: string[],
  prevTouched: boolean,
  prevDirty: boolean,
  nextVal: unknown,
  nextErrors: string[],
  nextTouched: boolean,
  nextDirty: boolean,
): boolean {
  if (prevVal !== nextVal) return false;
  if (prevTouched !== nextTouched) return false;
  if (prevDirty !== nextDirty) return false;

  if (prevErrors.length !== nextErrors.length) return false;
  for (let i = 0; i < prevErrors.length; i++) {
    if (prevErrors[i] !== nextErrors[i]) return false;
  }
  return true;
}

export function useField<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchema extends Record<string, any>,
  K extends keyof InferValues<TSchema> & string,
>(form: FormInstance<TSchema>, name: K): FieldState<InferValues<TSchema>[K]> {
  const setValue = useCallback(
    (val: InferValues<TSchema>[K]) => {
      form.setValue(name, val);
    },
    [form, name],
  );

  const subscribe = useMemo(() => {
    return (listener: () => void) => form.subscribe(listener);
  }, [form]);

  const cacheRef = useRef<{
    state: FieldState<InferValues<TSchema>[K]>;
    name: string;
  } | null>(null);

  const getSnapshot = useCallback(() => {
    const currentFormState = form.getState();
    const val = currentFormState.values[name];
    const errors = currentFormState.errors[name] || [];
    const touched = currentFormState.touched[name] ?? false;
    const dirty = currentFormState.dirty[name] ?? false;

    if (
      cacheRef.current &&
      cacheRef.current.name === name &&
      isFieldStateEqual(
        cacheRef.current.state.value,
        cacheRef.current.state.errors,
        cacheRef.current.state.touched,
        cacheRef.current.state.dirty,
        val,
        errors,
        touched,
        dirty,
      )
    ) {
      return cacheRef.current.state;
    }

    const newState: FieldState<InferValues<TSchema>[K]> = {
      value: val,
      errors,
      touched,
      dirty,
      setValue,
    };

    cacheRef.current = {
      state: newState,
      name,
    };

    return newState;
  }, [form, name, setValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
