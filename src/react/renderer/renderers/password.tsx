import React from 'react';
import type { PrimitiveFieldRendererProps } from '../types.js';

export function PasswordRenderer({
  id,
  name,
  value,
  onChange,
  className,
}: PrimitiveFieldRendererProps<string>) {
  return (
    <input
      className={['mf-input', className].filter(Boolean).join(' ')}
      type="password"
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
