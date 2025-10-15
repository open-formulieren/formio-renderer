import {useContext} from 'react';

import {FieldConfigContext, FormSettingsContext} from './context';

export const useFormSettings = () => useContext(FormSettingsContext);

/**
 * Given the field config context, calculated the (possibly) prefixed name.
 *
 * The prefix (if provided) is prepended with a `.` separator.
 *
 * @private
 */
export const useFieldConfig = (name: string): string => {
  const {namePrefix} = useContext(FieldConfigContext);
  if (namePrefix) {
    name = `${namePrefix}.${name}`;
  }
  return name;
};
