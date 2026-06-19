import type { FormInstance } from '../state/types.js';

export function useForm<TSchema extends Record<string, any>>(
  _schema: TSchema,
): FormInstance<TSchema> {
  return {} as any;
}
