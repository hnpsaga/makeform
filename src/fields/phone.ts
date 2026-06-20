import type { PhoneField } from '../types/field.js';

export type PhoneFieldConfig = Partial<Omit<PhoneField, 'type'>>;

export function phoneField(config: PhoneFieldConfig = {}): PhoneField {
  return {
    type: 'phone',
    ...config,
  };
}
