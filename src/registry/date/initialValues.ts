import type {DateComponentSchema} from '@open-formulieren/types';

import type {DateValue} from '@/components/forms/DateField/types';
import type {GetInitialValues} from '@/registry/types';

const getInitialValues: GetInitialValues<DateComponentSchema, DateValue | DateValue[]> = ({
  key,
  defaultValue,
  multiple = false,
}: DateComponentSchema) => {
  // if no default value is explicitly specified, return the empty value, depending on
  // whether it's multiple false/true on this component.
  if (defaultValue === undefined) {
    defaultValue = multiple ? [] : null;
  }

  // ensure there's always at least one item to start with (matches Formio.js latest
  // behaviour, where the last item in the default value cannot be removed.
  if (multiple && Array.isArray(defaultValue) && defaultValue.length === 0) {
    defaultValue = [null];
  }

  return {[key]: defaultValue};
};

export default getInitialValues;
