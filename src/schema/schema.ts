import type { BaseField } from '../types/field.js';

/**
 * A form schema is a record of named field definitions.
 *
 * Each field extends `BaseField<TValue>` for some value type.
 * Using `BaseField<unknown>` here (rather than the `FormField` discriminated union)
 * avoids variance conflicts when fields carry `validators?: Validator<TValue>[]`
 * with literal-narrowed value types (e.g. `SelectField<'admin' | 'user'>`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Schema = Record<string, BaseField<any>>;
