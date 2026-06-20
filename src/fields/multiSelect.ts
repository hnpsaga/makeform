import type { MultiSelectField } from '../types/field.js';

export type MultiSelectFieldConfig<TValue extends string = string> = Omit<
  MultiSelectField<TValue>,
  'type'
>;

export function multiSelectField<const TValue extends string>(
  config: MultiSelectFieldConfig<TValue>,
): MultiSelectField<TValue> {
  return {
    type: 'multi-select',
    ...config,
  };
}
