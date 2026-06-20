import React from 'react';
import type { FormRendererProps } from './types.js';
import type { FormField } from '../../types/field.js';
import { FieldRenderer } from './FieldRenderer.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FormRenderer<TSchema extends Record<string, any>>({
  form,
  schema,
  renderers,
}: FormRendererProps<TSchema>) {
  const fieldNames = Object.keys(schema) as (keyof TSchema & string)[];

  return (
    <div className="mf-form" data-testid="form-renderer">
      <div className="mf-grid">
        {fieldNames.map((name) => {
          const field = schema[name] as FormField;
          return (
            <FieldRenderer key={name} form={form} name={name} field={field} renderers={renderers} />
          );
        })}
      </div>
    </div>
  );
}
