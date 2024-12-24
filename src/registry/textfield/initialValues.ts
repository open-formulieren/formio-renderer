import type {TextFieldComponentSchema} from '@open-formulieren/types';

const getInitialValues = ({
  key,
  defaultValue,
  multiple = false,
}: TextFieldComponentSchema): [string, string | string[]][] => {
  // if no default value is explicitly specified, return the empty value, depending on
  // whether it's multiple false/true on this component.
  if (defaultValue === undefined) {
    defaultValue = multiple ? [] : '';
  }
  return [[key, defaultValue]];
};

export default getInitialValues;
