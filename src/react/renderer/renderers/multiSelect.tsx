import React from 'react';
import type { MultiSelectRendererProps } from '../types.js';

export function MultiSelectRenderer<TValue extends string = string>({
  id,
  name,
  value,
  options,
  onChange,
}: MultiSelectRendererProps<TValue>) {
  return (
    <select
      className="mf-select"
      id={id}
      name={name}
      multiple
      value={[...value]}
      onChange={(e) => {
        const selected = Array.from(e.target.selectedOptions).map((o) => o.value as TValue);
        onChange(selected);
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
