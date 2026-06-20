import type { FormField, SelectOption } from '../../types/field.js';
import type { FormInstance } from '../../state/types.js';

export interface PrimitiveFieldRendererProps<TValue> {
  id: string;
  name: string;
  value: TValue;
  onChange: (value: TValue) => void;
}

export interface CheckboxRendererProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface RadioRendererProps<TValue extends string = string> {
  id: string;
  name: string;
  value: TValue;
  options: readonly SelectOption<TValue>[];
  onChange: (value: TValue) => void;
}

export interface SelectRendererProps<TValue extends string = string> {
  id: string;
  name: string;
  value: TValue;
  options: readonly SelectOption<TValue>[];
  onChange: (value: TValue) => void;
}

export interface MultiSelectRendererProps<TValue extends string = string> {
  id: string;
  name: string;
  value: readonly TValue[];
  options: readonly SelectOption<TValue>[];
  onChange: (value: TValue[]) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FieldRendererProps<
  TSchema extends Record<string, any>,
  K extends keyof TSchema & string,
> {
  form: FormInstance<TSchema>;
  name: K;
  field: FormField;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FormRendererProps<TSchema extends Record<string, any>> {
  form: FormInstance<TSchema>;
  schema: TSchema;
}
