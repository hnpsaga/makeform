import { describe, expect, test, vi } from 'vitest';
import {
  createForm,
  textareaField,
  emailField,
  dateField,
  phoneField,
  radioField,
  multiSelectField,
  customField,
} from '../../src/index.js';

describe('createForm with extended fields', () => {
  test('resolves default values correctly', () => {
    vi.useFakeTimers();
    const now = new Date();
    vi.setSystemTime(now);

    const schema = {
      bio: textareaField(),
      email: emailField(),
      birthday: dateField(),
      phone: phoneField(),
      gender: radioField({
        options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
        ],
      }),
      skills: multiSelectField({
        options: [{ label: 'React', value: 'react' }],
      }),
      loc: customField<{ lat: number; lng: number }>(),
    };

    const form = createForm(schema);
    const values = form.getValues();

    expect(values.bio).toBe('');
    expect(values.email).toBe('');
    expect(values.birthday.getTime()).toBe(now.getTime());
    expect(values.phone).toBe('');
    expect(values.gender).toBe('male');
    expect(values.skills).toEqual([]);
    expect(values.loc).toBeUndefined();

    vi.useRealTimers();
  });

  test('uses custom defaultValue if supplied', () => {
    const customDate = new Date(2000, 0, 1);
    const schema = {
      birthday: dateField({ defaultValue: customDate }),
      gender: radioField({
        defaultValue: 'female',
        options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
        ],
      }),
      skills: multiSelectField({
        defaultValue: ['react'],
        options: [{ label: 'React', value: 'react' }],
      }),
    };

    const form = createForm(schema);
    const values = form.getValues();

    expect(values.birthday).toBe(customDate);
    expect(values.gender).toBe('female');
    expect(values.skills).toEqual(['react']);
  });
});
