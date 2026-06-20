import { describe, expect, test } from 'vitest';
import { textareaField, emailField, dateField, phoneField } from '../../src/index.js';

describe('extended primitive field builders', () => {
  test('textareaField sets correct type and accepts config', () => {
    const field = textareaField({ label: 'Bio', defaultValue: 'Hello' });
    expect(field.type).toBe('textarea');
    expect(field.label).toBe('Bio');
    expect(field.defaultValue).toBe('Hello');
  });

  test('emailField sets correct type', () => {
    const field = emailField({ label: 'Email' });
    expect(field.type).toBe('email');
    expect(field.label).toBe('Email');
  });

  test('dateField sets correct type', () => {
    const date = new Date();
    const field = dateField({ label: 'Birthday', defaultValue: date });
    expect(field.type).toBe('date');
    expect(field.defaultValue).toBe(date);
  });

  test('phoneField sets correct type', () => {
    const field = phoneField({ label: 'Phone' });
    expect(field.type).toBe('phone');
    expect(field.label).toBe('Phone');
  });
});
