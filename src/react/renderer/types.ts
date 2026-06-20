import type { ComponentType } from 'react';
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

export interface CustomFieldRendererProps<TValue> {
  id: string;
  name: string;
  value: TValue;
  errors: string[];
  touched: boolean;
  dirty: boolean;
  setValue: (value: TValue) => void;
}

export type Renderers = Partial<{
  text: ComponentType<PrimitiveFieldRendererProps<string>>;
  textarea: ComponentType<PrimitiveFieldRendererProps<string>>;
  email: ComponentType<PrimitiveFieldRendererProps<string>>;
  phone: ComponentType<PrimitiveFieldRendererProps<string>>;
  number: ComponentType<PrimitiveFieldRendererProps<number>>;
  date: ComponentType<PrimitiveFieldRendererProps<Date>>;
  checkbox: ComponentType<CheckboxRendererProps>;
  radio: ComponentType<RadioRendererProps>;
  select: ComponentType<SelectRendererProps>;
  'multi-select': ComponentType<MultiSelectRendererProps>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  custom?: Record<string, ComponentType<CustomFieldRendererProps<any>>>;
}>;

export interface FieldRendererProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchema extends Record<string, any>,
  K extends keyof TSchema & string,
> {
  form: FormInstance<TSchema>;
  name: K;
  field: FormField;
  renderers?: Renderers;
}

export interface FormRendererProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchema extends Record<string, any>,
> {
  form: FormInstance<TSchema>;
  schema: TSchema;
  renderers?: Renderers;
}
