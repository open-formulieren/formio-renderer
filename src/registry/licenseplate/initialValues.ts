import type {LicensePlateComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';

const getInitialValues: GetInitialValues<LicensePlateComponentSchema, string | string[]> = ({
  key,
  defaultValue,
  multiple = false,
}: LicensePlateComponentSchema) => {
  // if no default value is explicitly specified, return the empty value, depending on
  // whether it's multiple false/true on this component.
  if (defaultValue === undefined) {
    defaultValue = multiple ? [] : '';
  }

  // ensure there's always at least one item to start with (matches Formio.js latest
  // behaviour, where the last item in the default value cannot be removed.
  if (multiple && defaultValue.length === 0) {
    defaultValue = [''];
  }

  return {[key]: defaultValue};
};

export default getInitialValues;
