import type { Validator } from './types.js';

/**
 * Runs all validators for a single field value and collects error messages.
 *
 * @param value     The field's current value.
 * @param validators An array of `Validator<T>` functions to run in order.
 * @returns         An array of error message strings. Empty when all validators pass.
 */
export function validateField<T>(value: T, validators: Validator<T>[]): string[] {
  const errors: string[] = [];
  for (const validate of validators) {
    const error = validate(value);
    if (error !== null) {
      errors.push(error);
    }
  }
  return errors;
}
