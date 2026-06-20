import { describe, expect, test } from 'vitest';
import { email, phone } from '../../src/index.js';

describe('email validator', () => {
  test('passes for valid email formats', () => {
    expect(email()('test@example.com')).toBeNull();
    expect(email()('user.name+label@sub.domain.org')).toBeNull();
  });

  test('fails for invalid email formats', () => {
    expect(email()('invalidemail')).toBe('Invalid email format');
    expect(email()('test@')).toBe('Invalid email format');
    expect(email()('test@domain')).toBe('Invalid email format');
  });

  test('uses custom error message', () => {
    expect(email('Bad email')('invalid')).toBe('Bad email');
  });
});

describe('phone validator', () => {
  test('passes for valid phone formats', () => {
    expect(phone()('1234567')).toBeNull();
    expect(phone()('+1 (555) 123-4567')).toBeNull();
    expect(phone()('123-456-7890')).toBeNull();
  });

  test('fails for invalid phone formats', () => {
    expect(phone()('abc')).toBe('Invalid phone number format');
    expect(phone()('12')).toBe('Invalid phone number format');
  });

  test('uses custom error message', () => {
    expect(phone('Bad phone')('invalid')).toBe('Bad phone');
  });
});
