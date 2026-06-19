import { describe, expect, test } from 'vitest';
import { expectTypeOf } from 'vitest';
import {
  required,
  min,
  max,
  pattern,
  custom,
  validateField,
  validateForm,
  textField,
  numberField,
  checkboxField,
} from '../../src/index.js';
import type { Validator, ValidationResult } from '../../src/index.js';

// ---------------------------------------------------------------------------
// Validator typing
// ---------------------------------------------------------------------------

describe('Validator type', () => {
  test('Validator<string> matches (value: string) => string | null', () => {
    expectTypeOf<Validator<string>>().toEqualTypeOf<(value: string) => string | null>();
  });

  test('Validator<number> matches (value: number) => string | null', () => {
    expectTypeOf<Validator<number>>().toEqualTypeOf<(value: number) => string | null>();
  });
});

// ---------------------------------------------------------------------------
// required()
// ---------------------------------------------------------------------------

describe('required()', () => {
  test('passes for a non-empty string', () => {
    expect(required<string>()('hello')).toBeNull();
  });

  test('fails for an empty string', () => {
    expect(required<string>()('')).toBe('Field is required');
  });

  test('fails for a whitespace-only string', () => {
    expect(required<string>()('   ')).toBe('Field is required');
  });

  test('fails for null', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(required<any>()(null)).toBe('Field is required');
  });

  test('fails for undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(required<any>()(undefined)).toBe('Field is required');
  });

  test('passes for a number (presence check)', () => {
    expect(required<number>()(42)).toBeNull();
  });

  test('passes for zero (zero is a valid number)', () => {
    expect(required<number>()(0)).toBeNull();
  });

  test('passes for false boolean', () => {
    expect(required<boolean>()(false)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// min()
// ---------------------------------------------------------------------------

describe('min() for strings', () => {
  test('passes when string length equals limit', () => {
    expect(min(3)('abc')).toBeNull();
  });

  test('passes when string length exceeds limit', () => {
    expect(min(3)('abcdef')).toBeNull();
  });

  test('fails when string length is below limit', () => {
    expect(min(3)('ab')).toBe('Minimum length is 3');
  });

  test('fails for empty string with min(1)', () => {
    expect(min(1)('')).toBe('Minimum length is 1');
  });
});

describe('min() for numbers', () => {
  test('passes when value equals limit', () => {
    expect(min(18)(18)).toBeNull();
  });

  test('passes when value exceeds limit', () => {
    expect(min(18)(25)).toBeNull();
  });

  test('fails when value is below limit', () => {
    expect(min(18)(17)).toBe('Minimum value is 18');
  });

  test('fails for negative value against positive limit', () => {
    expect(min(0)(-1)).toBe('Minimum value is 0');
  });
});

// ---------------------------------------------------------------------------
// max()
// ---------------------------------------------------------------------------

describe('max() for strings', () => {
  test('passes when string length equals limit', () => {
    expect(max(5)('hello')).toBeNull();
  });

  test('passes when string length is below limit', () => {
    expect(max(5)('hi')).toBeNull();
  });

  test('fails when string length exceeds limit', () => {
    expect(max(5)('toolong')).toBe('Maximum length is 5');
  });

  test('passes for empty string', () => {
    expect(max(5)('')).toBeNull();
  });
});

describe('max() for numbers', () => {
  test('passes when value equals limit', () => {
    expect(max(100)(100)).toBeNull();
  });

  test('passes when value is below limit', () => {
    expect(max(100)(50)).toBeNull();
  });

  test('fails when value exceeds limit', () => {
    expect(max(100)(101)).toBe('Maximum value is 100');
  });
});

// ---------------------------------------------------------------------------
// pattern()
// ---------------------------------------------------------------------------

describe('pattern()', () => {
  test('passes when value matches regex', () => {
    expect(pattern(/^\d+$/)('12345')).toBeNull();
  });

  test('fails when value does not match regex', () => {
    const result = pattern(/^\d+$/)('abc');
    expect(result).not.toBeNull();
  });

  test('uses custom message when provided', () => {
    expect(pattern(/^\d+$/, 'Numbers only')('abc')).toBe('Numbers only');
  });

  test('uses default message when no custom message provided', () => {
    const result = pattern(/^\d+$/)('abc');
    expect(result).toContain('/^\\d+$/');
  });

  test('passes for an email-like regex', () => {
    expect(pattern(/^[^@]+@[^@]+\.[^@]+$/)('user@example.com')).toBeNull();
  });

  test('fails for an invalid email-like value', () => {
    expect(pattern(/^[^@]+@[^@]+\.[^@]+$/, 'Invalid email')('notanemail')).toBe('Invalid email');
  });
});

// ---------------------------------------------------------------------------
// custom()
// ---------------------------------------------------------------------------

describe('custom()', () => {
  test('passes when custom function returns null', () => {
    const validator = custom<string>((v) => (v.startsWith('A') ? null : 'Must start with A'));
    expect(validator('Alice')).toBeNull();
  });

  test('fails when custom function returns a message', () => {
    const validator = custom<string>((v) => (v.startsWith('A') ? null : 'Must start with A'));
    expect(validator('Bob')).toBe('Must start with A');
  });

  test('works with number values', () => {
    const isEven = custom<number>((v) => (v % 2 === 0 ? null : 'Must be even'));
    expect(isEven(4)).toBeNull();
    expect(isEven(3)).toBe('Must be even');
  });
});

// ---------------------------------------------------------------------------
// validateField()
// ---------------------------------------------------------------------------

describe('validateField()', () => {
  test('returns empty array when no validators provided', () => {
    expect(validateField('anything', [])).toEqual([]);
  });

  test('returns empty array when all validators pass', () => {
    expect(validateField('hello', [required(), min(3)])).toEqual([]);
  });

  test('accumulates multiple errors from multiple failing validators', () => {
    const errors = validateField('', [required(), min(3)]);
    expect(errors).toHaveLength(2);
    expect(errors).toContain('Field is required');
    expect(errors).toContain('Minimum length is 3');
  });

  test('returns only failed validator messages', () => {
    // "ab" passes required() but fails min(3)
    const errors = validateField('ab', [required(), min(3)]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe('Minimum length is 3');
  });

  test('works with number validators', () => {
    const errors = validateField(15, [min(18), max(65)]);
    expect(errors).toEqual(['Minimum value is 18']);
  });

  test('preserves error order matching validator order', () => {
    // 'ab' fails required? No — required passes for non-empty. Use a value that fails all three.
    // 'x': fails min(5) (length 1), fails max(0) (length 1 > 0), passes required()
    // Let's use validators where all three fire on 'ab':
    //   required() → passes
    //   min(5)     → fails (length 2)
    //   max(1)     → fails (length 2)
    const errors = validateField('ab', [min(5), max(1), custom(() => 'Custom error')]);
    expect(errors).toHaveLength(3);
    expect(errors[0]).toBe('Minimum length is 5');
    expect(errors[1]).toBe('Maximum length is 1');
    expect(errors[2]).toBe('Custom error');
  });
});

// ---------------------------------------------------------------------------
// validateForm()
// ---------------------------------------------------------------------------

describe('validateForm()', () => {
  test('returns valid: true with empty errors for a valid form', () => {
    const schema = {
      name: textField({ validators: [required(), min(3)] }),
      age: numberField({ validators: [min(18)] }),
    };
    const result = validateForm(schema, { name: 'Alice', age: 25 });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test('returns valid: false with errors for an invalid form', () => {
    const schema = {
      name: textField({ validators: [required(), min(3)] }),
      age: numberField({ validators: [min(18)] }),
    };
    const result = validateForm(schema, { name: '', age: 15 });
    expect(result.valid).toBe(false);
    expect(result.errors['name']).toContain('Field is required');
    expect(result.errors['age']).toContain('Minimum value is 18');
  });

  test('accumulates multiple errors per field', () => {
    const schema = {
      name: textField({ validators: [required(), min(3)] }),
    };
    const result = validateForm(schema, { name: '' });
    expect(result.errors['name']).toHaveLength(2);
    expect(result.errors['name']).toContain('Field is required');
    expect(result.errors['name']).toContain('Minimum length is 3');
  });

  test('returns valid: true for an empty schema', () => {
    const result = validateForm({}, {});
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test('skips fields with no validators', () => {
    const schema = {
      name: textField({ label: 'Name' }),
      age: numberField({ validators: [min(18)] }),
    };
    const result = validateForm(schema, { name: '', age: 25 });
    expect(result.valid).toBe(true);
    expect(result.errors['name']).toBeUndefined();
  });

  test('only includes failing fields in errors', () => {
    const schema = {
      name: textField({ validators: [required()] }),
      bio: textField({ validators: [required()] }),
    };
    const result = validateForm(schema, { name: 'Alice', bio: '' });
    expect(result.valid).toBe(false);
    expect(result.errors['name']).toBeUndefined();
    expect(result.errors['bio']).toContain('Field is required');
  });

  test('ValidationResult type is correct', () => {
    const schema = {
      name: textField({ validators: [required()] }),
    };
    const result = validateForm(schema, { name: 'Alice' });
    expectTypeOf(result).toEqualTypeOf<ValidationResult>();
  });

  test('works with checkbox fields', () => {
    const isTrue = custom<boolean>((v) => (v ? null : 'Must be checked'));
    const schema = {
      agreed: checkboxField({ validators: [isTrue] }),
    };
    const passing = validateForm(schema, { agreed: true });
    expect(passing.valid).toBe(true);

    const failing = validateForm(schema, { agreed: false });
    expect(failing.valid).toBe(false);
    expect(failing.errors['agreed']).toContain('Must be checked');
  });

  test('works with custom validators in schema', () => {
    const schema = {
      username: textField({
        validators: [
          required(),
          custom<string>((v) =>
            /^[a-z0-9_]+$/.test(v) ? null : 'Lowercase, digits, underscore only',
          ),
        ],
      }),
    };
    const passing = validateForm(schema, { username: 'valid_user' });
    expect(passing.valid).toBe(true);

    const failing = validateForm(schema, { username: 'Invalid User!' });
    expect(failing.valid).toBe(false);
    expect(failing.errors['username']).toContain('Lowercase, digits, underscore only');
  });

  test('handles a schema with validators: undefined (edge case)', () => {
    const schema = {
      name: textField(),
    };
    const result = validateForm(schema, { name: '' });
    expect(result.valid).toBe(true);
  });
});
