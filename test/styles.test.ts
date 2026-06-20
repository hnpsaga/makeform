import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Default Theme Stylesheet', () => {
  const cssPath = resolve(__dirname, '../src/styles/default.css');

  it('exists at src/styles/default.css', () => {
    expect(existsSync(cssPath)).toBe(true);
  });

  it('contains expected class selectors', () => {
    const css = readFileSync(cssPath, 'utf-8');
    expect(css).toContain('.mf-form');
    expect(css).toContain('.mf-grid');
    expect(css).toContain('.mf-field');
    expect(css).toContain('.mf-label');
    expect(css).toContain('.mf-input');
    expect(css).toContain('.mf-textarea');
    expect(css).toContain('.mf-select');
    expect(css).toContain('.mf-checkbox');
    expect(css).toContain('.mf-radio');
    expect(css).toContain('.mf-radio-group');
    expect(css).toContain('.mf-error');
    expect(css).toContain('.mf-error__text');
  });

  it('has non-trivial content length', () => {
    const css = readFileSync(cssPath, 'utf-8');
    expect(css.length).toBeGreaterThan(600);
  });

  it('uses CSS Grid for responsive layout', () => {
    const css = readFileSync(cssPath, 'utf-8');
    expect(css).toContain('display: grid');
    expect(css).toContain('repeat(auto-fit, minmax(250px, 1fr))');
  });
});
