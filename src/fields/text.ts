import type { TextField } from '../types/field.js';

export type TextFieldConfig = Partial<Omit<TextField, 'type'>>;

export function textField(config: TextFieldConfig = {}): TextField {
  return {
    type: 'text',
    ...config,
  };
}
