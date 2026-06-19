import { expect, test } from 'vitest';
import { selectField } from '../../src/fields/select.js';

test('creates field correctly with options', () => {
  const field = selectField({
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
    ],
  });
  expect(field.type).toBe('select');
  expect(field.options).toEqual([
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ]);
  expect(field.label).toBeUndefined();
  expect(field.defaultValue).toBeUndefined();
});

test('preserves label and default value', () => {
  const field = selectField({
    label: 'Role',
    defaultValue: 'user',
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
    ],
  });
  expect(field.type).toBe('select');
  expect(field.label).toBe('Role');
  expect(field.defaultValue).toBe('user');
});

test('preserves description', () => {
  const field = selectField({
    description: 'Select your system role',
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
    ],
  });
  expect(field.type).toBe('select');
  expect(field.description).toBe('Select your system role');
});
