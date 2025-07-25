import type {NumberComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';

const getInitialValues: GetInitialValues<NumberComponentSchema, number | null> = ({
  key,
  defaultValue,
}: NumberComponentSchema) => {
  // if no default value is explicitly specified, return the empty value
  if (defaultValue === undefined) {
    defaultValue = null;
  }
  return {[key]: defaultValue};
};

export default getInitialValues;
