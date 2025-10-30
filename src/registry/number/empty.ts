import type {NumberComponentSchema} from '@open-formulieren/types';

import type {IsEmpty} from '@/registry/types';

const isEmpty: IsEmpty<NumberComponentSchema, null | number> = (_component, value) => {
  return value === undefined || value === null;
};

export default isEmpty;
