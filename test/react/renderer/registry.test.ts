import { describe, expect, it } from 'vitest';
import { builtInRenderers } from '../../../src/react/renderer/registry.js';

describe('builtInRenderers registry', () => {
  it('contains all expected field type keys', () => {
    const keys = Object.keys(builtInRenderers);
    expect(keys.sort()).toEqual(
      [
        'text',
        'textarea',
        'email',
        'phone',
        'number',
        'date',
        'checkbox',
        'radio',
        'select',
        'multi-select',
      ].sort(),
    );
  });

  it('maps text to a renderer function', () => {
    expect(typeof builtInRenderers.text).toBe('function');
  });

  it('maps textarea to a renderer function', () => {
    expect(typeof builtInRenderers.textarea).toBe('function');
  });

  it('maps email to a renderer function', () => {
    expect(typeof builtInRenderers.email).toBe('function');
  });

  it('maps phone to a renderer function', () => {
    expect(typeof builtInRenderers.phone).toBe('function');
  });

  it('maps number to a renderer function', () => {
    expect(typeof builtInRenderers.number).toBe('function');
  });

  it('maps date to a renderer function', () => {
    expect(typeof builtInRenderers.date).toBe('function');
  });

  it('maps checkbox to a renderer function', () => {
    expect(typeof builtInRenderers.checkbox).toBe('function');
  });

  it('maps radio to a renderer function', () => {
    expect(typeof builtInRenderers.radio).toBe('function');
  });

  it('maps select to a renderer function', () => {
    expect(typeof builtInRenderers.select).toBe('function');
  });

  it('maps multi-select to a renderer function', () => {
    expect(typeof builtInRenderers['multi-select']).toBe('function');
  });

  it('has exactly 10 entries', () => {
    expect(Object.keys(builtInRenderers)).toHaveLength(10);
  });

  it('each renderer is non-null and non-undefined', () => {
    const entries = Object.entries(builtInRenderers);
    for (const [_key, renderer] of entries) {
      expect(renderer).not.toBeNull();
      expect(renderer).not.toBeUndefined();
    }
  });
});
