import { describe, expect, test } from 'vitest';
import {
  textareaField,
  emailField,
  dateField,
  phoneField,
  passwordField,
} from '../../src/index.js';

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

  test('passwordField sets correct type and accepts config', () => {
    const field = passwordField({ label: 'Password', defaultValue: 'secret' });
    expect(field.type).toBe('password');
    expect(field.label).toBe('Password');
    expect(field.defaultValue).toBe('secret');
  });

  test('passwordField works with validators', () => {
    const field = passwordField({
      label: 'Password',
      validators: [() => 'error'],
    });
    expect(field.type).toBe('password');
    expect(field.validators).toBeDefined();
    expect(field.validators).toHaveLength(1);
  });
});
