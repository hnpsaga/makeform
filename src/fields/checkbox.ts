import type { CheckboxField } from '../types/field.js';

export type CheckboxFieldConfig = Partial<Omit<CheckboxField, 'type'>>;

export function checkboxField(config: CheckboxFieldConfig = {}): CheckboxField {
  return {
    type: 'checkbox',
    ...config,
  };
}
