import type {TimeComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';

const getInitialValues: GetInitialValues<TimeComponentSchema, string | string[]> = ({
  key,
  defaultValue,
  multiple = false,
}: TimeComponentSchema) => {
  // if no default value is explicitly specified, return the empty value, depending on
  // whether it's multiple false/true on this component.
  if (defaultValue === undefined) {
    defaultValue = multiple ? [] : '';
  }
  return {[key]: defaultValue};
};

export default getInitialValues;
