import type { ValidationResult } from '../validation/types.js';
import type { InferValues } from '../types/inference.js';

export interface FormState<TValues> {
  values: TValues;
  errors: Record<string, string[]>;
  touched: Record<keyof TValues, boolean>;
  dirty: Record<keyof TValues, boolean>;
}

export type Listener<TValues> = (state: FormState<TValues>) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FormInstance<TSchema extends Record<string, any>> {
  getValues(): InferValues<TSchema>;
  getValue<K extends keyof InferValues<TSchema>>(field: K): InferValues<TSchema>[K];
  setValue<K extends keyof InferValues<TSchema>>(field: K, value: InferValues<TSchema>[K]): void;
  validate(): ValidationResult;
  reset(): void;
  subscribe(listener: Listener<InferValues<TSchema>>): () => void;
  unsubscribe(listener: Listener<InferValues<TSchema>>): void;
}
