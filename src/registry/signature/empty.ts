import type {SignatureComponentSchema} from '@open-formulieren/types';

import type {IsEmpty} from '@/registry/types';

const isEmpty: IsEmpty<SignatureComponentSchema, string> = (_component, value) => {
  // Based on the formio textfield implementation
  return value == null || value.trim().length === 0;
};

export default isEmpty;
