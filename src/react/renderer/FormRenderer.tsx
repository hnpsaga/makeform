import React from 'react';
import type { FormRendererProps } from './types.js';
import type { FormField } from '../../types/field.js';
import { FieldRenderer } from './FieldRenderer.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FormRenderer<TSchema extends Record<string, any>>({
  form,
  schema,
  renderers,
  fieldRenderers,
  classNames,
}: FormRendererProps<TSchema>) {
  const fieldNames = Object.keys(schema) as (keyof TSchema & string)[];

  function mergeClasses(...classes: (string | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className={mergeClasses('mf-form', classNames?.form)} data-testid="form-renderer">
      <div className={mergeClasses('mf-grid', classNames?.grid)}>
        {fieldNames.map((name) => {
          const field = schema[name] as FormField;
          return (
            <FieldRenderer
              key={name}
              form={form}
              name={name}
              field={field}
              renderers={renderers}
              fieldRenderers={fieldRenderers}
              classNames={classNames}
            />
          );
        })}
      </div>
    </div>
  );
}
