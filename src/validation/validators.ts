import type { Validator } from './types.js';

/**
 * Validates that a value is not empty.
 *
 * - `string`: fails if empty or whitespace-only.
 * - `number`: always passes (presence of a number is sufficient).
 * - `boolean`: always passes.
 * - `null` / `undefined`: fails.
 */
export function required<T>(): Validator<T> {
  return (value: T): string | null => {
    if (value === null || value === undefined) {
      return 'Field is required';
    }
    if (typeof value === 'string' && value.trim() === '') {
      return 'Field is required';
    }
    return null;
  };
}

/**
 * Validates a minimum constraint.
 *
 * - For `string` values: minimum character length.
 * - For `number` values: minimum numeric value.
 */
export function min(limit: number): Validator<string | number> {
  return (value: string | number): string | null => {
    if (typeof value === 'string') {
      return value.length >= limit ? null : `Minimum length is ${limit}`;
    }
    return value >= limit ? null : `Minimum value is ${limit}`;
  };
}

/**
 * Validates a maximum constraint.
 *
 * - For `string` values: maximum character length.
 * - For `number` values: maximum numeric value.
 */
export function max(limit: number): Validator<string | number> {
  return (value: string | number): string | null => {
    if (typeof value === 'string') {
      return value.length <= limit ? null : `Maximum length is ${limit}`;
    }
    return value <= limit ? null : `Maximum value is ${limit}`;
  };
}

/**
 * Validates that a string value matches a regular expression.
 */
export function pattern(regex: RegExp, message?: string): Validator<string> {
  return (value: string): string | null => {
    return regex.test(value)
      ? null
      : (message ?? `Value does not match pattern ${regex.toString()}`);
  };
}

/**
 * Creates a custom validator from a user-supplied function.
 *
 * The function should return `null` (valid) or an error message string (invalid).
 */
export function custom<T>(fn: (value: T) => string | null): Validator<T> {
  return fn;
}
