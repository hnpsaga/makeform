import { useState, useRef, useEffect, useCallback } from 'react';
import {
  useForm,
  FormRenderer,
  textareaField,
  numberField,
  customField,
  required,
  min,
  max,
  custom,
} from '@hnpsaga/makeform';
import type { PrimitiveFieldRendererProps, CustomFieldRendererProps } from '@hnpsaga/makeform';

const sectionStyle: React.CSSProperties = {
  marginBottom: '2.5rem',
  padding: '1.25rem',
  border: '1px solid #e5e7eb',
  borderRadius: '0.5rem',
  background: '#fff',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.5rem 1.5rem',
  color: '#fff',
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  fontSize: '0.875rem',
};

const stateBoxStyle: React.CSSProperties = {
  marginTop: '1rem',
  padding: '0.75rem',
  background: '#f3f4f6',
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  overflowX: 'auto',
};

function badge(label: string, bg: string, color: string) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.125rem 0.5rem',
        borderRadius: '0.25rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.025em',
        marginLeft: '0.5rem',
        verticalAlign: 'middle',
        background: bg,
        color,
      }}
    >
      {label}
    </span>
  );
}

function rendererBadge() {
  return badge('renderers', '#fef3c7', '#92400e');
}

// ─── Rich Text Editor ────────────────────────────────────────────────────────

const richTextSchema = {
  content: textareaField({
    label: 'Article Content',
    validators: [required()],
  }),
};

function RichTextRenderer({ id, value, onChange }: PrimitiveFieldRendererProps<string>) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncValue = useCallback(() => {
    if (editorRef.current && !isSyncing) {
      setIsSyncing(true);
      onChange(editorRef.current.innerHTML);
      setTimeout(() => setIsSyncing(false), 0);
    }
  }, [onChange, isSyncing]);

  const exec = (command: string) => {
    document.execCommand(command, false);
    syncValue();
    editorRef.current?.focus();
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && !isSyncing) {
      editorRef.current.innerHTML = value;
    }
  }, [value, isSyncing]);

  const btnBase: React.CSSProperties = {
    padding: '0.25rem 0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.25rem',
    background: '#f9fafb',
    cursor: 'pointer',
    fontSize: '0.8rem',
    minWidth: '2rem',
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" style={btnBase} onClick={() => exec('bold')} title="Bold">
          <strong>B</strong>
        </button>
        <button type="button" style={btnBase} onClick={() => exec('italic')} title="Italic">
          <em>I</em>
        </button>
        <button type="button" style={btnBase} onClick={() => exec('underline')} title="Underline">
          <u>U</u>
        </button>
        <button
          type="button"
          style={btnBase}
          onClick={() => exec('insertOrderedList')}
          title="Numbered List"
        >
          1.
        </button>
        <button
          type="button"
          style={btnBase}
          onClick={() => exec('insertUnorderedList')}
          title="Bullet List"
        >
          •
        </button>
      </div>
      <div
        ref={editorRef}
        id={id}
        contentEditable
        suppressContentEditableWarning
        onInput={syncValue}
        style={{
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          padding: '0.75rem',
          minHeight: '8rem',
          outline: 'none',
          fontSize: '1rem',
          lineHeight: 1.6,
        }}
        data-placeholder="Write your article content..."
      />
    </div>
  );
}

function RichTextExample() {
  const form = useForm(richTextSchema);

  return (
    <section style={sectionStyle}>
      <h3 style={{ marginTop: 0 }}>Rich Text Editor {rendererBadge()}</h3>
      <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
        A <code>textarea</code> field with a custom renderer providing a toolbar and{' '}
        <code>contentEditable</code> area. MakeForm still owns the label, error display, and layout.
      </p>
      <FormRenderer
        form={form}
        schema={richTextSchema}
        renderers={{ textarea: RichTextRenderer }}
      />
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => {
            form.markAllTouched();
            form.validate();
          }}
          style={{ ...buttonStyle, background: '#6366f1' }}
        >
          Validate
        </button>
        <button onClick={() => form.reset()} style={{ ...buttonStyle, background: '#6b7280' }}>
          Reset
        </button>
      </div>
      <div style={stateBoxStyle}>
        <strong>State:</strong>{' '}
        <code style={{ wordBreak: 'break-word' }}>{JSON.stringify(form.getState().values)}</code>
      </div>
    </section>
  );
}

// ─── Star Rating ─────────────────────────────────────────────────────────────

const ratingSchema = {
  rating: numberField({
    label: 'Rating',
    validators: [required(), min(1), max(5)],
    defaultValue: 0,
  }),
};

function RatingRenderer({ value, onChange }: PrimitiveFieldRendererProps<number>) {
  const [hovered, setHovered] = useState(0);

  const starStyle = (filled: boolean): React.CSSProperties => ({
    fontSize: '2rem',
    cursor: 'pointer',
    color: filled ? '#f59e0b' : '#d1d5db',
    transition: 'color 0.15s',
    background: 'none',
    border: 'none',
    padding: '0 0.125rem',
    lineHeight: 1,
  });

  return (
    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            style={starStyle(filled)}
            onClick={() => onChange(star === value ? 0 : star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            {filled ? '\u2605' : '\u2606'}
          </button>
        );
      })}
      <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>
        {value > 0 ? `${value}/5` : 'Not rated'}
      </span>
    </div>
  );
}

function RatingExample() {
  const form = useForm(ratingSchema);

  return (
    <section style={sectionStyle}>
      <h3 style={{ marginTop: 0 }}>Star Rating {rendererBadge()}</h3>
      <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
        A <code>number</code> field with a custom renderer showing clickable stars. MakeForm handles
        the label, min/max validation messages, and error positioning.
      </p>
      <FormRenderer form={form} schema={ratingSchema} renderers={{ number: RatingRenderer }} />
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => {
            form.markAllTouched();
            form.validate();
          }}
          style={{ ...buttonStyle, background: '#6366f1' }}
        >
          Validate
        </button>
        <button onClick={() => form.reset()} style={{ ...buttonStyle, background: '#6b7280' }}>
          Reset
        </button>
      </div>
      <div style={stateBoxStyle}>
        <strong>State:</strong>{' '}
        <code style={{ wordBreak: 'break-word' }}>{JSON.stringify(form.getState().values)}</code>
      </div>
    </section>
  );
}

// ─── Tag Selector ────────────────────────────────────────────────────────────

const tagSchema = {
  tags: customField<string[]>({
    label: 'Tags',
    component: 'tagSelector',
    defaultValue: [],
    validators: [
      custom<string[]>((value) => {
        if (!value || value.length === 0) return 'Add at least one tag';
        return null;
      }),
    ],
  }),
};

function TagSelectorRenderer({ value, setValue }: CustomFieldRendererProps<string[]>) {
  const [input, setInput] = useState('');

  const tags = value ?? [];

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setValue([...tags, trimmed]);
    }
  };

  const removeTag = (index: number) => {
    setValue(tags.filter((_, i) => i !== index));
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
      setInput('');
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const tagStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    background: '#e0e7ff',
    color: '#4338ca',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: 500,
  };

  const removeBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: 1,
    color: '#6366f1',
    padding: '0 0.125rem',
    display: 'inline-flex',
    alignItems: 'center',
  };

  return (
    <div
      style={{
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        padding: '0.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.375rem',
        minHeight: '2.5rem',
        cursor: 'text',
      }}
      onClick={(e) => {
        const input = e.currentTarget.querySelector('input');
        if (input) input.focus();
      }}
    >
      {tags.map((tag, i) => (
        <span key={`${tag}-${i}`} style={tagStyle}>
          {tag}
          <button
            type="button"
            style={removeBtn}
            onClick={(e) => {
              e.stopPropagation();
              removeTag(i);
            }}
            aria-label={`Remove ${tag}`}
          >
            &times;
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => {
          if (input.trim()) {
            addTag(input);
            setInput('');
          }
        }}
        placeholder={tags.length === 0 ? 'Type and press Enter to add tags' : 'Add tag...'}
        style={{
          border: 'none',
          outline: 'none',
          flex: '1 1 120px',
          minWidth: '100px',
          fontSize: '0.875rem',
          padding: '0.25rem',
          background: 'transparent',
        }}
      />
    </div>
  );
}

function TagSelectorExample() {
  const form = useForm(tagSchema);

  return (
    <section style={sectionStyle}>
      <h3 style={{ marginTop: 0 }}>Tag Selector {rendererBadge()}</h3>
      <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
        A <code>custom</code> field using <code>renderers.custom.tagSelector</code>. MakeForm owns
        the label, layout, and validation — the renderer only provides the tag chip input
        experience.
      </p>
      <FormRenderer
        form={form}
        schema={tagSchema}
        renderers={{
          custom: { tagSelector: TagSelectorRenderer },
        }}
      />
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => {
            form.markAllTouched();
            form.validate();
          }}
          style={{ ...buttonStyle, background: '#6366f1' }}
        >
          Validate
        </button>
        <button onClick={() => form.reset()} style={{ ...buttonStyle, background: '#6b7280' }}>
          Reset
        </button>
      </div>
      <div style={stateBoxStyle}>
        <strong>State:</strong>{' '}
        <code style={{ wordBreak: 'break-word' }}>{JSON.stringify(form.getState().values)}</code>
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdvancedComponents() {
  return (
    <div>
      <h1>Advanced Components</h1>

      <section
        style={{
          marginBottom: '2rem',
          padding: '1.25rem',
          background: '#eef2ff',
          borderRadius: '0.5rem',
          border: '1px solid #c7d2fe',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Why renderers?</h2>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
          When a component only replaces the input control, use <code>renderers</code>. MakeForm
          continues to handle labels, validation, errors, and layout — you only provide the
          specialized input element. This is the ideal extension point for rich text editors, star
          ratings, tag selectors, color pickers, date pickers, phone inputs, and other advanced UI
          controls.
        </p>
      </section>

      <RichTextExample />
      <RatingExample />
      <TagSelectorExample />
    </div>
  );
}
