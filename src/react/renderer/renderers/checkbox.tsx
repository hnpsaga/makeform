import React from 'react';
import type { CheckboxRendererProps } from '../types.js';

export function CheckboxRenderer({ id, name, checked, onChange }: CheckboxRendererProps) {
  return (
    <input
      className="mf-checkbox"
      type="checkbox"
      id={id}
      name={name}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}
