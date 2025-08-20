import type {CheckboxComponentSchema} from '@open-formulieren/types';

import {IsEmpty} from '@/registry/types';

const isEmpty: IsEmpty<CheckboxComponentSchema, boolean> = (_componentDefinition, value) => {
  return !value;
};

export default isEmpty;
