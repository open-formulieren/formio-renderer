import {AnyComponentSchema} from '@open-formulieren/types';

/**
 * A form configuration using Form.io's JSON schema.
 *
 * Ultimately this is a recursive tree structure where (almost) every node is a
 * supported Form.io component type. Typical exceptions would be containers like
 * columns which contain their children in a different node type (which itself have
 * components as children again).
 */
export interface FormioConfiguration {
  display?: 'form'; // we only support the form display variant, and it may be absent
  settings?: any; // unused by us
  components: AnyComponentSchema[];
}
