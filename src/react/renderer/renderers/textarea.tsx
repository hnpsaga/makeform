import React from 'react';
import type { PrimitiveFieldRendererProps } from '../types.js';

export function TextareaRenderer({
  id,
  name,
  value,
  onChange,
}: PrimitiveFieldRendererProps<string>) {
  return <textarea id={id} name={name} value={value} onChange={(e) => onChange(e.target.value)} />;
}
