import { expectTypeOf, test } from 'vitest';
import type {
  InferField,
  TextareaField,
  EmailField,
  DateField,
  PhoneField,
  RadioField,
  MultiSelectField,
  CustomField,
} from '../src/index.js';

test('extended single field inference works', () => {
  expectTypeOf<InferField<TextareaField>>().toEqualTypeOf<string>();
  expectTypeOf<InferField<EmailField>>().toEqualTypeOf<string>();
  expectTypeOf<InferField<DateField>>().toEqualTypeOf<Date>();
  expectTypeOf<InferField<PhoneField>>().toEqualTypeOf<string>();
  expectTypeOf<InferField<RadioField<'male' | 'female'>>>().toEqualTypeOf<'male' | 'female'>();
  expectTypeOf<InferField<MultiSelectField<'react'>>>().toEqualTypeOf<'react'[]>();
  expectTypeOf<InferField<CustomField<string>>>().toEqualTypeOf<string>();
});
