import type {CustomerProfileComponentSchema, CustomerProfileData} from '@open-formulieren/types';

import type {IsEmpty} from '@/registry/types';

import {DIGITAL_ADDRESS_FIELD_NAMES} from './constants';

const isEmpty: IsEmpty<CustomerProfileComponentSchema, CustomerProfileData | null> = (
  _componentDefinition,
  value
) => {
  if (value == null || !value.length) return true;

  /**
   * `Array.prototype.some` uses `true` to indicate containing a certain value,
   * while isEmpty uses `true` as an indication of a lack of value.
   *
   * So we have to reverse the logic inside, and the result of, `Array.prototype.some` to
   * use it for the isEmpty function.
   */
  return !value.some(item => {
    for (const key of DIGITAL_ADDRESS_FIELD_NAMES) {
      if (item[key]) return true;
    }
    return false;
  });
};

export default isEmpty;
