# Field Renderer Architecture Proposal

## 1. Problem Statement

MakeForm's current rendering model owns the entire field presentation inside `FieldRenderer`:

```
FieldRenderer
├── Label
├── Error
├── Layout
└── Input Renderer
```

The `renderers` prop allows replacement of the Input Renderer only. Label, error, and layout are always provided by MakeForm's `FieldRenderer`.

This works well when the consumer only needs to customize the input control (Persona 3). It creates friction when the consumer wants to own label, error, or layout presentation (Persona 2).

**Three personas exist but only two are supported:**

| Persona              | Wants                                     | Supported |
| -------------------- | ----------------------------------------- | --------- |
| 1 — Default UI       | Everything from MakeForm                  | ✅        |
| 2 — Design System    | Own label, error, layout, input           | ❌        |
| 3 — Custom Component | MakeForm label/error/layout, custom input | ✅        |

Persona 2 currently has no extension point that grants control over label, error, or layout structure.

---

## 2. Current Architecture

### 2.1 Rendering Ownership

```
FormRenderer
  └── FieldRenderer  (per field)
        ├── Label          ← MakeForm (no override)
        ├── Error          ← MakeForm (no override)
        ├── Layout         ← MakeForm (classNames only)
        └── Input          ← renderers.{type} OR built-in
```

### 2.2 Renderer Resolution

```
renderers: {
  text:        ComponentType<PrimitiveFieldRendererProps<string>>
  textarea:    ComponentType<PrimitiveFieldRendererProps<string>>
  email:       ComponentType<PrimitiveFieldRendererProps<string>>
  phone:       ComponentType<PrimitiveFieldRendererProps<string>>
  password:    ComponentType<PrimitiveFieldRendererProps<string>>
  number:      ComponentType<PrimitiveFieldRendererProps<number>>
  date:        ComponentType<PrimitiveFieldRendererProps<Date>>
  checkbox:    ComponentType<CheckboxRendererProps>
  radio:       ComponentType<RadioRendererProps>
  select:      ComponentType<SelectRendererProps>
  'multi-select': ComponentType<MultiSelectRendererProps>
  custom: {
    [name: string]: ComponentType<CustomFieldRendererProps<any>>
  }
}
```

### 2.3 Custom Field Flow

```
schema: customField<T>({ component: 'richText' })
                  ↓
FieldRenderer → switch('custom')
                  ↓
lookup: renderers.custom?.['richText']
                  ↓
CustomRenderer receives { id, name, value, errors, touched, dirty, setValue }
                  ↓
Label + Error still rendered by FieldRenderer
```

### 2.4 Key Limitation

Renderers receive only input-relevant props (`value`, `onChange`, `options`, `className`). They do not receive `label`, `errors`, `touched`, or `field metadata`. The label and error DOM is always produced by `FieldRenderer`.

---

## 3. Personas

### 3.1 Persona 1 — Default UI Consumer

```tsx
const form = useForm(schema);
return <FormRenderer form={form} schema={schema} />;
```

MakeForm provides everything. No customization needed.

### 3.2 Persona 2 — Design System Consumer

Wants to wrap fields in Material UI `TextField`, Chakra `FormControl`, etc.

These components already own:

- Label
- Error display
- Helper text
- Input layout

Current workaround:

```tsx
<FormRenderer
  renderers={{
    text: ({ id, value, onChange, className }) => (
      <TextField
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label="..." // must be hardcoded or passed externally
        error={false} // must be managed externally
        helperText=""
      />
    ),
  }}
/>
```

Problems:

- Label is duplicated (FieldRenderer renders it, MUI TextField also needs it)
- Error state must be managed separately
- No access to `field.label`, `field.description`, `errors[]`, `touched`
- Layout is controlled by two systems simultaneously

### 3.3 Persona 3 — Custom Component Consumer

```tsx
customField<string>({ component: 'richText' })

<FormRenderer
  renderers={{
    custom: { richText: RichTextEditor },
  }}
/>
```

Works because custom components are slotted into MakeForm's label/error/layout scaffolding.

---

## 4. Alternatives Considered

### 4.1 Alternative A — fieldRenderers (Recommended)

Introduce a new `fieldRenderers` prop on `FormRenderer` and `FieldRenderer` that accepts complete field renderer components.

These renderers receive full field context (label, errors, touched, dirty, value, setValue, field metadata) and own the entire field DOM.

**Takes precedence over renderers + built-in.**

### 4.2 Alternative B — Renderer Metadata on Schema

```tsx
textField({
  label: 'Name',
  renderer: { labelPosition: 'top', showErrors: true },
});
```

**Rejected.** Adds configuration to schema for presentation concerns. Schema is for data structure, not layout. Does not solve Persona 2 — design systems need structural replacement, not configuration.

### 4.3 Alternative C — Presentation Ownership Flags

```tsx
<FormRenderer
  renderers={{ text: CustomInput }}
  fieldFlags={{
    label: 'external', // FieldRenderer skips label
    error: 'external', // FieldRenderer skips error
  }}
/>
```

**Rejected.** Fragile and incomplete. Flags must anticipate every possible ownership combination. Consumer still must coordinate between MakeForm's partial rendering and their own. Error-prone for complex cases like checkbox (inline label) vs standard label.

### 4.4 Alternative D — Complete Renderer Replacement via New Prop

Add a `wrapper` prop that wraps the entire field:

```tsx
<FormRenderer wrapper={CustomFieldWrapper} />
```

**Rejected.** Wrapper pattern does not provide fine-grained per-field-type control. Every field passes through the same wrapper. Cannot handle per-type MUI integration (e.g., MUI TextField for text, MUI Select for select).

### 4.5 Alternative E — Enhanced Renderer Props

Add more context to existing renderers:

```tsx
// Current
export interface PrimitiveFieldRendererProps<TValue> {
  id: string;
  name: string;
  value: TValue;
  onChange: (value: TValue) => void;
  className?: string;
  inputType?: string;
}

// Proposed enhancement
export interface PrimitiveFieldRendererProps<TValue> {
  id: string;
  name: string;
  value: TValue;
  onChange: (value: TValue) => void;
  className?: string;
  inputType?: string;
  label?: string; // NEW
  errors?: string[]; // NEW
  touched?: boolean; // NEW
  description?: string; // NEW
}
```

**Partially useful but does not solve Persona 2.** Even with label/errors in props, the renderer cannot control whether FieldRenderer renders its own label and error DOM alongside. The consumer would get duplicate labels or need the flags approach (Alternative C).

---

## 5. Recommended Design — fieldRenderers

### 5.1 Concept

`fieldRenderers` is a new extension point that accepts complete field-level renderers. A field renderer replaces the **entire** rendering of a field — label, error, layout, and input — within the same component.

### 5.2 Resolution Priority

**Built-in Fields**

```text
fieldRenderers.{type}
        ↓
renderers.{type}
        ↓
builtInRenderers.{type}
```

Examples:

```text
fieldRenderers.text
        ↓
renderers.text
        ↓
builtInRenderers.text
```

```text
fieldRenderers.select
        ↓
renderers.select
        ↓
builtInRenderers.select
```

**Custom Fields**

```text
fieldRenderers.custom.richText
        ↓
renderers.custom.richText
        ↓
no renderer found
```

Examples:

```tsx
customField({
  component: 'richText',
});
```

Resolution:

```text
fieldRenderers.custom.richText
        ↓
renderers.custom.richText
        ↓
null
```

The highest-priority renderer that exists is used.

When a `fieldRenderers` entry exists for a field type, `FieldRenderer` delegates entirely to that component. The consumer's field renderer owns the full presentation.

When no `fieldRenderers` entry exists, the existing `renderers` chain applies as before.

### 5.3 Responsibilities

**Field Renderer (complete):**

```
FieldRenderer
├── label (consumer-owned)
├── error (consumer-owned)
├── layout (consumer-owned)
└── input (consumer-owned)
```

**Input Renderer (existing):**

```
FieldRenderer (MakeForm)
├── label (MakeForm)
├── error (MakeForm)
├── layout (MakeForm)
└── Input Renderer (consumer override)
```

### 5.4 Interaction with Existing System

| Feature                                                        | Interaction                                                                            |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `renderers`                                                    | When `fieldRenderers.{type}` exists, `renderers.{type}` is ignored                     |
| classNames                                                     | Not applied automatically. Field renderers are responsible for their own presentation. |
| `customField`                                                  | `fieldRenderers.custom` works the same way — replaces the entire field                 |
| Schema metadata (`label`, `description`)                       | Available in props for field renderer to use or ignore                                 |
| Validation (`errors`, `touched`, `dirty`)                      | Passed as props — field renderer decides how to display                                |
| `useField`                                                     | Form state subscriptions remain unchanged                                              |
| `fieldRenderers.custom.richText` + `renderers.custom.richText` | field renderer takes precedence                                                        |
| `fieldRenderers.text` + `renderers.text`                       | field renderer takes precedence                                                        |
| no field renderer present                                      | existing renderers chain works unchanged                                               |

### 5.5 Non-Goals

The fieldRenderers architecture is not intended to:

- Replace existing renderers
- Deprecate existing renderers
- Force all consumers into field-level rendering
- Change default MakeForm UI behavior

The existing renderers extension point remains the preferred solution for:

- Rich text editors
- Date pickers
- Phone inputs
- Address autocomplete
- Specialized input controls

Field renderers exist specifically for consumers that want to replace the entire field presentation layer.

---

## 6. Proposed API

### 6.1 Type Definitions

```ts
export interface FieldRendererProps<TValue, TField extends FormField = FormField> {
  id: string;
  name: string;
  field: TField;
  fieldState: FieldState<TValue>;
}
```

**Rationale**

Field renderers are intended to own the complete field presentation.

Passing `fieldState` instead of flattening:

```ts
value;
errors;
touched;
dirty;
setValue;
```

keeps the API aligned with MakeForm's existing React model and avoids prop growth in the future.

Field renderers can access:

```ts
fieldState.value;
fieldState.errors;
fieldState.touched;
fieldState.dirty;
fieldState.setValue();
```

through a single object.

### 6.2 FieldRenderers Type

```ts
export type FieldRenderers = Partial<{
  text: ComponentType<FieldRendererProps<string, TextField>>;
  textarea: ComponentType<FieldRendererProps<string, TextareaField>>;
  email: ComponentType<FieldRendererProps<string, EmailField>>;
  phone: ComponentType<FieldRendererProps<string, PhoneField>>;
  password: ComponentType<FieldRendererProps<string, PasswordField>>;
  number: ComponentType<FieldRendererProps<number, NumberField>>;
  date: ComponentType<FieldRendererProps<Date, DateField>>;
  checkbox: ComponentType<FieldRendererProps<boolean, CheckboxField>>;
  radio: ComponentType<FieldRendererProps<string, RadioField>>;
  select: ComponentType<FieldRendererProps<string, SelectField>>;
  'multi-select': ComponentType<FieldRendererProps<string[], MultiSelectField>>;

  custom?: Record<string, ComponentType<FieldRendererProps<any, CustomField>>>;
}>;
```

### 6.3 Props Extension

```ts
// FormRendererProps — add fieldRenderers
export interface FormRendererProps<TSchema extends Record<string, any>> {
  form: FormInstance<TSchema>;
  schema: TSchema;
  renderers?: Renderers;
  fieldRenderers?: FieldRenderers; // NEW
  classNames?: ClassNames;
}

// FieldRendererProps — add fieldRenderers
export interface FieldRendererProps<
  TSchema extends Record<string, any>,
  K extends keyof TSchema & string,
> {
  form: FormInstance<TSchema>;
  name: K;
  field: FormField;
  renderers?: Renderers;
  fieldRenderers?: FieldRenderers; // NEW
  classNames?: ClassNames;
}
```

### 6.4 Resolution Logic (Conceptual)

For custom fields, resolution follows the same pattern:

```text
fieldRenderers.custom?.[component]
        ↓
renderers.custom?.[component]
        ↓
null
```

where component is the CustomField component identifier.

```ts
function renderField() {
  const FieldRendererOverride = fieldRenderers?.[field.type];
  if (FieldRendererOverride) {
    // Complete replacement — consumer owns everything
    return (
      <FieldRendererOverride
        id={id}
        name={name}
        field={field}
        fieldState={fieldState}
      />
    );
  }

  // Fall through to existing renderers chain
  // ... existing label/error/input logic
}
```

### 6.5 Public API Shape

```ts
import {
  useForm,
  FormRenderer,
  type FieldRenderers,
  type FieldRendererProps,
} from '@hnpsaga/makeform';
```

Consumers only need to import:

- `FieldRenderers` when defining renderer maps
- `FieldRendererProps` when implementing complete field renderers

The existing `Renderers` API remains unchanged.

---

## 7. Example Usage

### 7.1 Material UI TextField

```tsx
function MuiTextRenderer({ id, name, field, fieldState }: FieldRendererProps<string, TextField>) {
  return (
    <TextField
      id={id}
      name={name}
      label={field.label}
      value={fieldState.value}
      onChange={(e) => fieldState.setValue(e.target.value)}
      error={fieldState.touched && fieldState.errors.length > 0}
      helperText={
        fieldState.touched && fieldState.errors.length > 0 ? fieldState.errors[0] : undefined
      }
      fullWidth
    />
  );
}
```

### 7.2 Chakra UI Select

```tsx
import { Select, FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/react';

import type { FieldRendererProps, SelectField } from '@hnpsaga/makeform';

function ChakraSelectRenderer({
  id,
  name,
  field,
  fieldState,
}: FieldRendererProps<string, SelectField>) {
  return (
    <FormControl isInvalid={fieldState.touched && fieldState.errors.length > 0}>
      <FormLabel htmlFor={id}>{field.label}</FormLabel>

      <Select
        id={id}
        name={name}
        value={fieldState.value}
        onChange={(e) => fieldState.setValue(e.target.value)}
      >
        {field.options.map((option) => (
          <option key={String(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      {fieldState.touched &&
        fieldState.errors.map((error) => <FormErrorMessage key={error}>{error}</FormErrorMessage>)}
    </FormControl>
  );
}
```

### 7.3 Custom Field Renderer

```tsx
customField<string>({
  component: 'richText',
  label: 'Bio',
});

function RichTextFieldRenderer({ field, fieldState }: FieldRendererProps<string>) {
  return (
    <div>
      <label>{field.label}</label>

      <RichTextEditor value={fieldState.value} onChange={fieldState.setValue} />

      {fieldState.touched && fieldState.errors.length > 0 && (
        <div role="alert">{fieldState.errors[0]}</div>
      )}
    </div>
  );
}

<FormRenderer
  fieldRenderers={{
    custom: {
      richText: RichTextFieldRenderer,
    },
  }}
/>;
```

### 7.4 Mixed Usage — Renderers + Field Renderers

```tsx
<FormRenderer
  form={form}
  schema={schema}
  renderers={{
    text: SimpleTextInput, // works for text
  }}
  fieldRenderers={{
    // Overrides renderers.text for these types
    select: ChakraSelectRenderer,
    checkbox: MuiCheckboxRenderer,
    // text still uses renderers.text above
  }}
/>
```

---

## 8. Migration Impact

### 8.1 Backwards Compatibility

**No breaking changes.** The `fieldRenderers` prop is additive. Existing code using `renderers` continues to work identically.

When `renderers.text` is provided and `fieldRenderers.text` is not, the existing behavior is preserved.

When `fieldRenderers.text` is provided, it takes precedence over `renderers.text`.

### 8.2 Migration Strategy

1. Add `fieldRenderers` type and prop (new feature, no migration needed)
2. Existing `renderers` users continue without changes
3. Design system adopters incrementally add `fieldRenderers` for specific types
4. Migration path for `renderers` → `fieldRenderers` when full field control is needed

### 8.3 Risks

| Risk                                    | Impact                                                          | Mitigation                                              |
| --------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| API surface increase                    | Low — single new prop                                           | Well-documented boundary                                |
| Renderer duplicate effort               | Low — field renderers replace, not duplicate                    | Clear priority docs                                     |
| Custom field API overlap                | Low — both renderers.custom and fieldRenderers.custom can exist | Resolution priority is explicitly documented            |
| Accidental usage when renderers suffice | Low — documentation guides choice                               | Field renderers are more code; users choose when needed |

### 8.4 Complexity Assessment

- **Runtime complexity:** Minimal. Single conditional check in FieldRenderer.
- **Type complexity:** Moderate. Field-level generics for each field type.
- **Maintenance complexity:** Low. Field renderers are independent components.

---

## 9. Alternatives Summary

| Alternative                     | Description                              | Verdict                                        |
| ------------------------------- | ---------------------------------------- | ---------------------------------------------- |
| **A — fieldRenderers**          | Complete field-level renderers           | **Recommended**                                |
| B — Renderer metadata on schema | Configure label/error behavior per field | Rejected — presentation in wrong layer         |
| C — Ownership flags             | Skip parts of FieldRenderer              | Rejected — fragile, incomplete                 |
| D — Wrapper prop                | Wrap entire field                        | Rejected — no per-type control                 |
| E — Enhanced renderer props     | Add context to existing props            | Rejected — duplicate label/error issue remains |

---

## 10. Recommendation

**Adopt `fieldRenderers`.**

The current MakeForm architecture successfully supports:

- Default UI consumers
- Custom input consumers

but does not provide a clean extension point for consumers that want to own the complete field presentation layer.

The proposed `fieldRenderers` abstraction addresses this gap by introducing a second rendering extension point with a clearly defined responsibility.

### Extension Point Responsibilities

```text
fieldRenderers
    → replace entire field presentation

renderers
    → replace input control only

built-in renderers
    → default MakeForm behavior
```

### Resolution Priority

```text
fieldRenderers
    ↓
renderers
    ↓
builtInRenderers
```

For custom fields:

```text
fieldRenderers.custom.richText
    ↓
renderers.custom.richText
    ↓
no renderer found
```

### Benefits

1. **Supports all three consumer personas**

   - Default UI consumers
   - Design-system consumers
   - Custom component consumers

2. **Preserves existing behavior**

   Existing `renderers` usage continues to function without modification.

3. **Provides a clean design-system integration path**

   Material UI, Chakra UI, Ant Design, and internal design systems can fully own labels, errors, layout, and inputs without conflicting with MakeForm's presentation layer.

4. **Keeps responsibilities explicit**

   Input renderers remain focused on input controls while field renderers own complete field presentation.

5. **Maintains backwards compatibility**

   The proposal is entirely additive and does not require migration of existing consumers.

### Final Recommendation

Proceed with implementation of `fieldRenderers` as a new additive extension point.

The resulting architecture is simple to explain, easy to document, backwards compatible, and provides a clear separation between:

- Form state management
- Input customization
- Complete field presentation customization

This positions MakeForm to support both lightweight form customization and full design-system integration without compromising either use case.
