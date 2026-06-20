import React from 'react';
import type { PrimitiveFieldRendererProps } from '../types.js';

export function TextRenderer({ id, name, value, onChange }: PrimitiveFieldRendererProps<string>) {
  return (
    <input
      className="mf-input"
      type="text"
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
