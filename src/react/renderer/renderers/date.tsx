import React from 'react';
import type { PrimitiveFieldRendererProps } from '../types.js';

function toDateInputValue(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0] ?? '';
}

export function DateRenderer({
  id,
  name,
  value,
  onChange,
  className,
}: PrimitiveFieldRendererProps<Date>) {
  return (
    <input
      className={['mf-input', className].filter(Boolean).join(' ')}
      type="date"
      id={id}
      name={name}
      value={toDateInputValue(value)}
      onChange={(e) => {
        const parsed = new Date(e.target.value);
        if (!isNaN(parsed.getTime())) {
          onChange(parsed);
        }
      }}
    />
  );
}
