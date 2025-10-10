import {useContext, useEffect, useState} from 'react';

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

/**
 * Track a debounced value.
 *
 * @param delay Delay in milliseconds.
 */
export function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}
