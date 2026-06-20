import React from 'react';
import type { PrimitiveFieldRendererProps } from '../types.js';

export function NumberRenderer({ id, name, value, onChange }: PrimitiveFieldRendererProps<number>) {
  return (
    <input
      className="mf-input"
      type="number"
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.valueAsNumber)}
    />
  );
}
