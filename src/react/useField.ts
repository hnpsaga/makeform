import type { FormInstance } from '../state/types.js';
import type { InferValues } from '../types/inference.js';
import type { FieldState } from './types.js';

export function useField<
  TSchema extends Record<string, any>,
  K extends keyof InferValues<TSchema> & string,
>(
  _form: FormInstance<TSchema>,
  _name: K,
): FieldState<InferValues<TSchema>[K]> {
  return {} as any;
}
