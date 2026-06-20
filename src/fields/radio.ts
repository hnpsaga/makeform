import type { RadioField } from '../types/field.js';

export type RadioFieldConfig<TValue extends string = string> = Omit<RadioField<TValue>, 'type'>;

export function radioField<const TValue extends string>(
  config: RadioFieldConfig<TValue>,
): RadioField<TValue> {
  return {
    type: 'radio',
    ...config,
  };
}
