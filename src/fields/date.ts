import type { DateField } from '../types/field.js';

export type DateFieldConfig = Partial<Omit<DateField, 'type'>>;

export function dateField(config: DateFieldConfig = {}): DateField {
  return {
    type: 'date',
    ...config,
  };
}
