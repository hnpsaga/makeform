import { expect, test } from 'vitest';
import { version } from '../src/index';

test('library version is defined', () => {
  expect(version).toBe('0.0.1');
});
