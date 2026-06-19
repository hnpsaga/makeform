import { expect, test } from 'vitest';
import * as makeform from '../src/index.js';

test('exports version and core features', () => {
  expect(makeform.version).toBe('0.0.1');
  expect(makeform.createForm).toBeTypeOf('function');
});
