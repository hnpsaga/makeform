import { TextRenderer } from './renderers/text.js';
import { TextareaRenderer } from './renderers/textarea.js';
import { EmailRenderer } from './renderers/email.js';
import { PhoneRenderer } from './renderers/phone.js';
import { PasswordRenderer } from './renderers/password.js';
import { NumberRenderer } from './renderers/number.js';
import { DateRenderer } from './renderers/date.js';
import { CheckboxRenderer } from './renderers/checkbox.js';
import { RadioRenderer } from './renderers/radio.js';
import { SelectRenderer } from './renderers/select.js';
import { MultiSelectRenderer } from './renderers/multiSelect.js';

export const builtInRenderers = {
  text: TextRenderer,
  textarea: TextareaRenderer,
  email: EmailRenderer,
  phone: PhoneRenderer,
  password: PasswordRenderer,
  number: NumberRenderer,
  date: DateRenderer,
  checkbox: CheckboxRenderer,
  radio: RadioRenderer,
  select: SelectRenderer,
  'multi-select': MultiSelectRenderer,
} as const;
