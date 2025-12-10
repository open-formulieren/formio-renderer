import type {AddressData, AddressNLComponentSchema} from '@open-formulieren/types';

import type {IsEmpty} from '@/registry/types';

import {SUB_FIELD_NAMES} from './constants';

const isEmpty: IsEmpty<AddressNLComponentSchema, Partial<AddressData> | null> = (
  _componentDefinition,
  value
) => {
  if (value == null || Object.keys(value).length === 0) return true;
  // output is not empty as soon as one sub field is not empty
  for (const key of SUB_FIELD_NAMES) {
    if (value[key]) return false;
  }
  return true;
};

export default isEmpty;
