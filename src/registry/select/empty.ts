import type {SelectComponentSchema} from '@open-formulieren/types';

import type {IsEmpty} from '@/registry/types';

const isEmpty: IsEmpty<SelectComponentSchema, string | string[]> = (
  _componentDefinition,
  value
) => {
  if (value == null) return true;

  const isFalsy = (valueToCheck: unknown) =>
    valueToCheck == null || valueToCheck.toString().trim().length === 0;
  const isEmptyArray = Array.isArray(value) && value.every(isFalsy);

  return Array.isArray(value) ? value.length === 0 || isEmptyArray : isFalsy(value || '');
};

export default isEmpty;
