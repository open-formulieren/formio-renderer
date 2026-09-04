import type {DateTimeComponentSchema} from '@open-formulieren/types';

import type {DateTimeValue} from '@/components/forms/DateTimeField/types';
import type {GetInitialValues} from '@/registry/types';

const getInitialValues: GetInitialValues<
  DateTimeComponentSchema,
  DateTimeValue | DateTimeValue[]
> = ({key, defaultValue, multiple = false}: DateTimeComponentSchema) => {
  // if no default value is explicitly specified, return the empty value, depending on
  // whether it's multiple false/true on this component.
  if (defaultValue === undefined) {
    defaultValue = multiple ? [] : null;
  }
  return {[key]: defaultValue};
};

export default getInitialValues;
