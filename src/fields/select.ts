import type { SelectField } from '../types/field.js';

export type SelectFieldConfig = Omit<SelectField, 'type'>;

export function selectField(config: SelectFieldConfig): SelectField {
  return {
    type: 'select',
    ...config,
  };
}
