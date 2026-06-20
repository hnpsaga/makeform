import { describe, expect, test, expectTypeOf } from 'vitest';
import { customField } from '../../src/index.js';
import type { CustomField } from '../../src/types/field.js';

describe('custom field builder', () => {
  test('customField sets correct type and wraps custom generic type', () => {
    interface Geo {
      lat: number;
      lng: number;
    }
    const field = customField<Geo>({
      label: 'Location',
      defaultValue: { lat: 0, lng: 0 },
    });
    expect(field.type).toBe('custom');
    expect(field.defaultValue).toEqual({ lat: 0, lng: 0 });
    expectTypeOf(field).toEqualTypeOf<CustomField<Geo>>();
  });
});
