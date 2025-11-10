import type {CustomerProfileComponentSchema, CustomerProfileData} from '@open-formulieren/types';

import type {IsEmpty} from '@/registry/types';

import {DIGITAL_ADDRESS_SUB_FIELD_NAMES, SUB_FIELD_NAMES} from './constants';

const isEmpty: IsEmpty<CustomerProfileComponentSchema, Partial<CustomerProfileData> | null> = (
  _componentDefinition,
  value
) => {
  if (value == null) return true;
  // output is not empty as soon as one subfield is not empty
  for (const key of SUB_FIELD_NAMES) {
    const subFieldValue = value[key];
    if (!subFieldValue) {
      continue;
    }

    for (const subKey of DIGITAL_ADDRESS_SUB_FIELD_NAMES) {
      if (subFieldValue[subKey]) return false;
    }
  }
  return true;
};

export default isEmpty;
