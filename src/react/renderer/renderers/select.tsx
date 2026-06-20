import React from 'react';
import type { SelectRendererProps } from '../types.js';

export function SelectRenderer<TValue extends string = string>({
  id,
  name,
  value,
  options,
  onChange,
}: SelectRendererProps<TValue>) {
  return (
    <select
      className="mf-select"
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value as TValue)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
