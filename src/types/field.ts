import type { Validator } from '../validation/types.js';

export interface BaseField<TValue> {
  readonly type: string;
  readonly label?: string;
  readonly description?: string;
  readonly defaultValue?: TValue;
  readonly validators?: Validator<TValue>[];
}

export interface TextField extends BaseField<string> {
  readonly type: 'text';
}

export interface NumberField extends BaseField<number> {
  readonly type: 'number';
}

export interface CheckboxField extends BaseField<boolean> {
  readonly type: 'checkbox';
}

export interface SelectOption<TValue extends string = string> {
  readonly label: string;
  readonly value: TValue;
}

export interface SelectField<TValue extends string = string> extends BaseField<TValue> {
  readonly type: 'select';
  readonly options: readonly SelectOption<TValue>[];
}

export type FormField = TextField | NumberField | CheckboxField | SelectField;
