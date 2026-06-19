import { useRef, useSyncExternalStore } from 'react';
import { createForm } from '../state/createForm.js';
import type { FormInstance } from '../state/types.js';

export function useForm<TSchema extends Record<string, any>>(
  schema: TSchema,
): FormInstance<TSchema> {
  const formRef = useRef<FormInstance<TSchema> | null>(null);
  if (!formRef.current) {
    formRef.current = createForm(schema);
  }
  const form = formRef.current;

  useSyncExternalStore(
    form.subscribe,
    () => form.getState(),
    () => form.getState(),
  );

  return form;
}
