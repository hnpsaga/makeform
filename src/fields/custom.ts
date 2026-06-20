import type { CustomField } from '../types/field.js';

export type CustomFieldConfig<TValue> = Partial<Omit<CustomField<TValue>, 'type'>>;

export function customField<TValue>(config: CustomFieldConfig<TValue> = {}): CustomField<TValue> {
  return {
    type: 'custom',
    ...config,
  };
}
