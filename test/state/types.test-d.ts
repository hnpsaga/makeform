import { expectTypeOf, test } from 'vitest';
import type { FormState, FormInstance } from '../../src/state/types.js';
import type { TextField, NumberField } from '../../src/types/field.js';

test('FormState and FormInstance type constraints', () => {
  type Schema = {
    name: TextField;
    age: NumberField;
  };
  type Values = {
    name: string;
    age: number;
  };

  expectTypeOf<FormState<Values>>().toEqualTypeOf<{
    values: Values;
    errors: Record<string, string[]>;
    touched: Record<keyof Values, boolean>;
    dirty: Record<keyof Values, boolean>;
  }>();
});
