import type { ComponentType } from 'react';
import type {
  FormField,
  TextField,
  TextareaField,
  EmailField,
  PhoneField,
  PasswordField,
  NumberField,
  DateField,
  CheckboxField,
  RadioField,
  SelectField,
  MultiSelectField,
  CustomField,
  SelectOption,
} from '../../types/field.js';
import type { FormInstance } from '../../state/types.js';
import type { FieldState } from '../types.js';

export interface ClassNames {
  form?: string;
  grid?: string;
  field?: string;
  label?: string;
  input?: string;
  textarea?: string;
  select?: string;
  checkbox?: string;
  radio?: string;
  error?: string;
}

export interface PrimitiveFieldRendererProps<TValue> {
  id: string;
  name: string;
  value: TValue;
  onChange: (value: TValue) => void;
  className?: string;
  inputType?: string;
}

export interface CheckboxRendererProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export interface RadioRendererProps<TValue extends string = string> {
  id: string;
  name: string;
  value: TValue;
  options: readonly SelectOption<TValue>[];
  onChange: (value: TValue) => void;
  className?: string;
}

export interface SelectRendererProps<TValue extends string = string> {
  id: string;
  name: string;
  value: TValue;
  options: readonly SelectOption<TValue>[];
  onChange: (value: TValue) => void;
  className?: string;
}

export interface MultiSelectRendererProps<TValue extends string = string> {
  id: string;
  name: string;
  value: readonly TValue[];
  options: readonly SelectOption<TValue>[];
  onChange: (value: TValue[]) => void;
  className?: string;
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
  password: ComponentType<PrimitiveFieldRendererProps<string>>;
  number: ComponentType<PrimitiveFieldRendererProps<number>>;
  date: ComponentType<PrimitiveFieldRendererProps<Date>>;
  checkbox: ComponentType<CheckboxRendererProps>;
  radio: ComponentType<RadioRendererProps>;
  select: ComponentType<SelectRendererProps>;
  'multi-select': ComponentType<MultiSelectRendererProps>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  custom?: Record<string, ComponentType<CustomFieldRendererProps<any>>>;
}>;

// ─── Field Renderer Types ─────────────────────────────────────────────────────

export interface FieldRendererProps<TValue, TField extends FormField = FormField> {
  id: string;
  name: string;
  field: TField;
  fieldState: FieldState<TValue>;
}

export type FieldRenderers = Partial<{
  text: ComponentType<FieldRendererProps<string, TextField>>;
  textarea: ComponentType<FieldRendererProps<string, TextareaField>>;
  email: ComponentType<FieldRendererProps<string, EmailField>>;
  phone: ComponentType<FieldRendererProps<string, PhoneField>>;
  password: ComponentType<FieldRendererProps<string, PasswordField>>;
  number: ComponentType<FieldRendererProps<number, NumberField>>;
  date: ComponentType<FieldRendererProps<Date, DateField>>;
  checkbox: ComponentType<FieldRendererProps<boolean, CheckboxField>>;
  radio: ComponentType<FieldRendererProps<string, RadioField>>;
  select: ComponentType<FieldRendererProps<string, SelectField>>;
  'multi-select': ComponentType<FieldRendererProps<string[], MultiSelectField>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  custom?: Record<string, ComponentType<FieldRendererProps<any, CustomField>>>;
}>;

export interface FieldRendererComponentProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchema extends Record<string, any>,
  K extends keyof TSchema & string,
> {
  form: FormInstance<TSchema>;
  name: K;
  field: FormField;
  renderers?: Renderers;
  fieldRenderers?: FieldRenderers;
  classNames?: ClassNames;
}

export interface FormRendererProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchema extends Record<string, any>,
> {
  form: FormInstance<TSchema>;
  schema: TSchema;
  renderers?: Renderers;
  fieldRenderers?: FieldRenderers;
  classNames?: ClassNames;
}
