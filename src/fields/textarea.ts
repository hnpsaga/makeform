import type { TextareaField } from '../types/field.js';

export type TextareaFieldConfig = Partial<Omit<TextareaField, 'type'>>;

export function textareaField(config: TextareaFieldConfig = {}): TextareaField {
  return {
    type: 'textarea',
    ...config,
  };
}
