import React from 'react';
import type { PrimitiveFieldRendererProps } from '../types.js';

export function TextareaRenderer({
  id,
  name,
  value,
  onChange,
}: PrimitiveFieldRendererProps<string>) {
  return (
    <textarea
      className="mf-textarea"
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
