/**
 * A validator function for a form field value of type `T`.
 *
 * Returns `null` when valid, or a non-empty error message string when invalid.
 */
export type Validator<T> = (value: T) => string | null;

/**
 * The result of validating a form or a single field.
 *
 * - `valid`: `true` when no errors were found.
 * - `errors`: A map of field name → list of error messages. Empty when valid.
 */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}
