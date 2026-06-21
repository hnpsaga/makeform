import type { PasswordField } from '../types/field.js';

export type PasswordFieldConfig = Partial<Omit<PasswordField, 'type'>>;

export function passwordField(config: PasswordFieldConfig = {}): PasswordField {
  return {
    type: 'password',
    ...config,
  };
}
