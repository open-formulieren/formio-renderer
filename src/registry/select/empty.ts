import type {SelectComponentSchema} from '@open-formulieren/types';

import {IsEmpty} from '@/registry/types';

const isEmpty: IsEmpty<SelectComponentSchema, string | string[]> = (
  _componentDefinition,
  value
) => {
  return Array.isArray(value) ? value.length === 0 : !value;
};

export default isEmpty;
