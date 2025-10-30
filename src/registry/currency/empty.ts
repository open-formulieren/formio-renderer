import type {CurrencyComponentSchema} from '@open-formulieren/types';

import type {IsEmpty} from '@/registry/types';

const isEmpty: IsEmpty<CurrencyComponentSchema, null | number> = (_component, value) => {
  return value === undefined || value === null;
};

export default isEmpty;
