import { expect, test } from 'vitest';
import { numberField } from '../../src/fields/number.js';

test('creates field correctly', () => {
  const field = numberField();
  expect(field.type).toBe('number');
  expect(field.label).toBeUndefined();
  expect(field.defaultValue).toBeUndefined();
});

test('preserves label and default value', () => {
  const field = numberField({ label: 'Age', defaultValue: 25 });
  expect(field.type).toBe('number');
  expect(field.label).toBe('Age');
  expect(field.defaultValue).toBe(25);
});

test('preserves description', () => {
  const field = numberField({ description: 'Enter your age' });
  expect(field.type).toBe('number');
  expect(field.description).toBe('Enter your age');
});
