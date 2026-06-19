import type { TextField } from '../types/field.js';

export interface TextFieldConfig {
  label?: string;
  description?: string;
  defaultValue?: string;
}

export function textField(config: TextFieldConfig = {}): TextField {
  return {
    type: 'text',
    ...config,
  };
}
