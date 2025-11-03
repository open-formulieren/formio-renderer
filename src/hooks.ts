import {getIn, useFormikContext} from 'formik';
import {useCallback, useContext, useEffect, useRef, useState} from 'react';

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
 * Workaround to extract the field-level validation error, if present.
 *
 * Formik kind of *assumes* that the `errors` structure only contains errors for leaf
 * nodes, but this falls apart for `FieldArray` situations where an individual item can
 * have an error but the container of values itself can have problems too.
 *
 * In the latter case, the error shape is not an array of strings, but just a string. This
 * causes problems when accessing the error of an item at `$name.$index`, which happily
 * returns the character of the error string at that position, which is of course not
 * what you want!
 *
 * This hook takes into account the current context and works around that by doing some
 * runtime type introspection to grab the correct error string.
 *
 * @see https://formik.org/docs/api/fieldarray#fieldarray-validation-gotchas
 */
export const useFieldError = (name: string, isMultiValue: boolean): string => {
  const {errors} = useFormikContext();
  const formikError: string | string[] = getIn(errors, name) ?? '';

  // for non-multivalue, we can just grab the error from the formik state as usual.
  if (!isMultiValue) {
    if (Array.isArray(formikError)) {
      throw new Error('Array errors for non-multi-value fields are not valid.');
    }
    return formikError;
  }

  // now we're sure this name targets an index item in an array, so we can strip of the
  // last bit and check the type of the error for the field (array-level validation
  // errors) and decide based on its type what to return.
  const prefix = name.split('.').slice(0, -1).join('.');
  const maybeArrayError: string | string[] | undefined = getIn(errors, prefix);
  if (!maybeArrayError) return '';

  // if it's an array, then we know there are individual item-level errors and we can
  // return the lookup from formik's error state
  if (Array.isArray(maybeArrayError)) {
    if (Array.isArray(formikError)) {
      throw new Error('Array errors for non-multi-value fields are not valid.');
    }
    return formikError;
  }

  // now we know the error is at the field-level, and there is no item-level information,
  // so ensure we don't grab the character at `$index` of the array-level error.
  return '';
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

/**
 * Debounce a callback
 *
 * @param delay Delay in milliseconds.
 */
export function useDebouncedCallback(callback: () => void, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(callback, delay);
  }, [callback, delay]);
}
