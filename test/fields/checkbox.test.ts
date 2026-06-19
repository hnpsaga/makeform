import { expect, test } from 'vitest';
import { checkboxField } from '../../src/fields/checkbox.js';

test('creates field correctly', () => {
  const field = checkboxField();
  expect(field.type).toBe('checkbox');
  expect(field.label).toBeUndefined();
  expect(field.defaultValue).toBeUndefined();
});

test('preserves label and boolean default value', () => {
  const field = checkboxField({ label: 'Subscribed', defaultValue: true });
  expect(field.type).toBe('checkbox');
  expect(field.label).toBe('Subscribed');
  expect(field.defaultValue).toBe(true);
});

test('preserves description', () => {
  const field = checkboxField({ description: 'Subscribe to newsletter' });
  expect(field.type).toBe('checkbox');
  expect(field.description).toBe('Subscribe to newsletter');
});

test('preserves false as defaultValue correctly', () => {
  const field = checkboxField({ defaultValue: false });
  expect(field.type).toBe('checkbox');
  expect(field.defaultValue).toBe(false);
});
