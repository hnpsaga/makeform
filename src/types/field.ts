export interface BaseField<TValue> {
  readonly type: string;
  readonly label?: string;
  readonly description?: string;
  readonly defaultValue?: TValue;
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

export interface SelectOption {
  readonly label: string;
  readonly value: string;
}

export interface SelectField extends BaseField<string> {
  readonly type: 'select';
  readonly options: readonly SelectOption[];
}

export type FormField = TextField | NumberField | CheckboxField | SelectField;
