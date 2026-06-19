import { expect, test } from 'vitest';
import { textField } from '../../src/fields/text.js';

test('creates field correctly', () => {
  const field = textField();
  expect(field.type).toBe('text');
  expect(field.label).toBeUndefined();
  expect(field.defaultValue).toBeUndefined();
});

test('preserves label and default value', () => {
  const field = textField({ label: 'Name', defaultValue: 'John' });
  expect(field.type).toBe('text');
  expect(field.label).toBe('Name');
  expect(field.defaultValue).toBe('John');
});

test('preserves description', () => {
  const field = textField({ description: 'Enter your name' });
  expect(field.type).toBe('text');
  expect(field.description).toBe('Enter your name');
});

