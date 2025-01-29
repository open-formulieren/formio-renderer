import type {PhoneNumberComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';

const getInitialValues: GetInitialValues<PhoneNumberComponentSchema, string | string[]> = ({
  key,
  defaultValue,
  multiple = false,
}: PhoneNumberComponentSchema) => {
  // if no default value is explicitly specified, return the empty value, depending on
  // whether it's multiple false/true on this component.
  if (defaultValue === undefined) {
    defaultValue = multiple ? [] : '';
  }
  return {[key]: defaultValue};
};

export default getInitialValues;
