import type { EmailField } from '../types/field.js';

export type EmailFieldConfig = Partial<Omit<EmailField, 'type'>>;

export function emailField(config: EmailFieldConfig = {}): EmailField {
  return {
    type: 'email',
    ...config,
  };
}
