import React from 'react';
import type { PrimitiveFieldRendererProps } from '../types.js';

const PHONE_ALLOWED = /[^0-9+\s\-()]/g;

export function PhoneRenderer({
  id,
  name,
  value,
  onChange,
  className,
}: PrimitiveFieldRendererProps<string>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = e.target.value.replace(PHONE_ALLOWED, '');
    onChange(filtered);
  };

  return (
    <input
      className={['mf-input', className].filter(Boolean).join(' ')}
      type="tel"
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
    />
  );
}
