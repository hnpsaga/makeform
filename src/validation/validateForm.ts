import type { BaseField } from '../types/field.js';
import type { Validator, ValidationResult } from './types.js';
import { validateField } from './validateField.js';

/**
 * A field that carries optional validators.
 * Used internally to narrow the schema fields during form validation.
 */
type FieldWithValidators<TValue> = BaseField<TValue> & {
  validators?: Validator<TValue>[];
};

/**
 * Validates an entire form schema against a set of values.
 *
 * For every field in `schema`, any attached `validators` are run against the
 * corresponding value from `values`. Errors are accumulated per field.
 *
 * @param schema A record of field definitions, each optionally carrying `validators`.
 * @param values A record of field values keyed by the same keys as `schema`.
 * @returns      A `ValidationResult` describing overall validity and per-field errors.
 *
 * @example
 * ```ts
 * const schema = {
 *   name: textField({ validators: [required(), min(3)] }),
 *   age:  numberField({ validators: [min(18)] }),
 * };
 *
 * const result = validateForm(schema, { name: '', age: 15 });
 * // result.valid  → false
 * // result.errors → { name: ['Field is required'], age: ['Minimum value is 18'] }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateForm<TSchema extends Record<string, FieldWithValidators<any>>>(
  schema: TSchema,
  values: { [K in keyof TSchema]: TSchema[K] extends FieldWithValidators<infer V> ? V : never },
): ValidationResult {
  const errors: Record<string, string[]> = {};

  for (const key of Object.keys(schema) as (keyof TSchema & string)[]) {
    const field = schema[key];
    const validators = field?.validators;
    if (!validators || validators.length === 0) {
      continue;
    }

    const value = values[key];
    const fieldErrors = validateField(value, validators);
    if (fieldErrors.length > 0) {
      errors[key] = fieldErrors;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
