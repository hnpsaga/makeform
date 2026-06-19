import type { NumberField } from '../types/field.js';

export type NumberFieldConfig = Partial<Omit<NumberField, 'type'>>;

export function numberField(config: NumberFieldConfig = {}): NumberField {
  return {
    type: 'number',
    ...config,
  };
}
