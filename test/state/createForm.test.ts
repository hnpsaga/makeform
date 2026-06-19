import { describe, expect, it } from 'vitest';
import { createForm } from '../../src/state/createForm.js';
import { textField, numberField, checkboxField } from '../../src/index.js';

describe('createForm values and getters', () => {
  it('resolves schema default values correctly', () => {
    const schema = {
      name: textField({ defaultValue: 'Alice' }),
      age: numberField(),
      agreed: checkboxField({ defaultValue: true }),
    };

    const form = createForm(schema);

    expect(form.getValues()).toEqual({
      name: 'Alice',
      age: 0,
      agreed: true,
    });

    expect(form.getValue('name')).toBe('Alice');
    expect(form.getValue('age')).toBe(0);
    expect(form.getValue('agreed')).toBe(true);
  });
});
