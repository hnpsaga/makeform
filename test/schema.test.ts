import { expect, test } from 'vitest';
import {
  textField,
  numberField,
  checkboxField,
  selectField,
} from '../src/index.js';
import type { Schema } from '../src/index.js';

test('schemas can be composed and typechecked', () => {
  const userSchema: Schema = {
    name: textField({ label: 'Name', defaultValue: 'John' }),
    age: numberField({ label: 'Age', defaultValue: 30 }),
    subscribed: checkboxField({ label: 'Subscribe', defaultValue: true }),
    role: selectField({
      label: 'Role',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    }),
  };

  expect(userSchema.name?.type).toBe('text');
  expect(userSchema.age?.type).toBe('number');
  expect(userSchema.subscribed?.type).toBe('checkbox');
  expect(userSchema.role?.type).toBe('select');
});
