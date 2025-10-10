import {useContext, useEffect, useState} from 'react';

import {FormSettingsContext} from './context';

export const useFormSettings = () => useContext(FormSettingsContext);

/**
 * Track a debounced value.
 */
export function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}
