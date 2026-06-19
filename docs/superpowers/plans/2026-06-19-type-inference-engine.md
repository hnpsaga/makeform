# MakeForm V1 – Phase 3 Type Inference Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the type inference engine `InferField` and `InferValues` for MakeForm to generate form value types directly from schemas, including auto-inference of literal select option values.

**Architecture:** Use TypeScript's generic type parameter mapping via `BaseField<TValue>`. Add a generic parameter to select fields and options, and use TypeScript 5.x `const` type parameters to preserve literal string option values automatically.

**Tech Stack:** TypeScript, Vitest

---

### Task 1: Basic Type Inference Types and Exports

**Files:**
- Create: `src/types/inference.ts`
- Modify: `src/types/index.ts`
- Create: `test/type-inference.test.ts`

- [ ] **Step 1: Write the failing tests**

Create the file `test/type-inference.test.ts` with tests for basic field types and basic schema inference:

```typescript
import { expectTypeOf, test } from 'vitest';
import {
  textField,
  numberField,
  checkboxField,
  selectField,
} from '../src/index.js';
import type { InferField, InferValues } from '../src/index.js';

test('single field inference maps core fields to their types', () => {
  const text = textField();
  const num = numberField();
  const checkbox = checkboxField();

  expectTypeOf<InferField<typeof text>>().toEqualTypeOf<string>();
  expectTypeOf<InferField<typeof num>>().toEqualTypeOf<number>();
  expectTypeOf<InferField<typeof checkbox>>().toEqualTypeOf<boolean>();
});

test('multi-field schema inference maps keys to field types', () => {
  const schema = {
    name: textField(),
    age: numberField(),
    subscribed: checkboxField(),
  };

  type Inferred = InferValues<typeof schema>;

  expectTypeOf<Inferred>().toEqualTypeOf<{
    name: string;
    age: number;
    subscribed: boolean;
  }>();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test` or `npx vitest run test/type-inference.test.ts`
Expected: Compilation failure because `InferField` and `InferValues` are not exported from `../src/index.js`.

- [ ] **Step 3: Write minimal implementation**

Create the file `src/types/inference.ts` with:

```typescript
import type { BaseField } from './field.js';

/**
 * Infers the value type of a single form field.
 */
export type InferField<TField> = TField extends BaseField<infer TValue> ? TValue : never;

/**
 * Infers the value types of a form schema object.
 */
export type InferValues<TSchema extends Record<string, any>> = {
  [K in keyof TSchema]: InferField<TSchema[K]>;
};
```

Modify `src/types/index.ts` to export it:

```typescript
export * from './field.js';
export * from './inference.js';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/type-inference.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add test/type-inference.test.ts src/types/inference.ts src/types/index.ts
git commit -m "feat: implement basic type inference types and exports"
```

---

### Task 2: Select Field Literal Union Inference

**Files:**
- Modify: `test/type-inference.test.ts`
- Modify: `src/types/field.ts`
- Modify: `src/fields/select.ts`

- [ ] **Step 1: Write the failing test**

Append this test to `test/type-inference.test.ts`:

```typescript
test('select field literal union inference works', () => {
  const select = selectField({
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
    ],
  });

  expectTypeOf<InferField<typeof select>>().toEqualTypeOf<'admin' | 'user'>();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/type-inference.test.ts`
Expected: FAIL (or compilation warning/failure) because `typeof select` is `SelectField` which evaluates to `string`, not the literal union `'admin' | 'user'`.

- [ ] **Step 3: Write minimal implementation**

Modify `src/types/field.ts` to make select generic:

```typescript
export interface SelectOption<TValue extends string = string> {
  readonly label: string;
  readonly value: TValue;
}

export interface SelectField<TValue extends string = string> extends BaseField<TValue> {
  readonly type: 'select';
  readonly options: readonly SelectOption<TValue>[];
}
```

Modify `src/fields/select.ts` to use `const` type parameter:

```typescript
import type { SelectField } from '../types/field.js';

export type SelectFieldConfig<TValue extends string = string> = Omit<SelectField<TValue>, 'type'>;

export function selectField<const TValue extends string>(
  config: SelectFieldConfig<TValue>
): SelectField<TValue> {
  return {
    type: 'select',
    ...config,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/type-inference.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add test/type-inference.test.ts src/types/field.ts src/fields/select.ts
git commit -m "feat: support select field literal union inference"
```
