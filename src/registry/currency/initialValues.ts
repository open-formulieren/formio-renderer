import type {CurrencyComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';

const getInitialValues: GetInitialValues<CurrencyComponentSchema, number | null> = ({
  key,
  defaultValue,
}: CurrencyComponentSchema) => {
  // if no default value is explicitly specified, return the empty value
  if (defaultValue === undefined) {
    defaultValue = null;
  }
  return {[key]: defaultValue};
};

export default getInitialValues;
