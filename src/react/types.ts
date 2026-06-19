export interface FieldState<TValue> {
  value: TValue;
  errors: string[];
  touched: boolean;
  dirty: boolean;
  setValue: (value: TValue) => void;
}
