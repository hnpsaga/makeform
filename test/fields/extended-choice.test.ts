import { describe, expect, test, expectTypeOf } from 'vitest';
import { radioField, multiSelectField } from '../../src/index.js';
import type { RadioField, MultiSelectField } from '../../src/types/field.js';

describe('extended choice field builders', () => {
  test('radioField sets correct type and accepts options', () => {
    const field = radioField({
      label: 'Gender',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
      ],
    });
    expect(field.type).toBe('radio');
    expect(field.options).toHaveLength(2);
    expect(field.options[0]?.value).toBe('male');
    expectTypeOf(field).toEqualTypeOf<RadioField<'male' | 'female'>>();
  });

  test('multiSelectField sets correct type and accepts options', () => {
    const field = multiSelectField({
      label: 'Skills',
      options: [
        { label: 'React', value: 'react' },
        { label: 'Vue', value: 'vue' },
      ],
    });
    expect(field.type).toBe('multi-select');
    expect(field.options).toHaveLength(2);
    expectTypeOf(field).toEqualTypeOf<MultiSelectField<'react' | 'vue'>>();
  });
});
