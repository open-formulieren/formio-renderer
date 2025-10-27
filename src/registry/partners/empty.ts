import type {PartnerDetails, PartnersComponentSchema} from '@open-formulieren/types';

import type {IsEmpty} from '@/registry/types';

import {SUB_FIELD_NAMES} from './constants';

const isEmpty: IsEmpty<PartnersComponentSchema, Partial<PartnerDetails>[] | null> = (
  _component,
  value
) => {
  if (value == null || value.length === 0) return true;

  /**
   * `Array.prototype.some` uses `true` to indicate containing a certain value,
   * while isEmpty uses `true` as an indication of lack of value.
   *
   * So we have to reverse the logic inside, and the result of, `Array.prototype.some` to
   * use it for the isEmpty function.
   */
  return !value.some(item => {
    for (const key of SUB_FIELD_NAMES) {
      if (item[key]) return true;
    }
    return false;
  });
};

export default isEmpty;
