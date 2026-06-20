import React from 'react';
import type { RadioRendererProps } from '../types.js';

export function RadioRenderer<TValue extends string = string>({
  id,
  name,
  value,
  options,
  onChange,
}: RadioRendererProps<TValue>) {
  return (
    <div className="mf-radio-group" role="radiogroup">
      {options.map((option) => {
        const optionId = `${id}-${option.value}`;
        return (
          <label key={option.value} htmlFor={optionId}>
            <input
              className="mf-radio"
              type="radio"
              id={optionId}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
