import type {PartnerDetails, PartnersComponentSchema} from '@open-formulieren/types';

import {IsEmpty} from '@/registry/types';

const isEmpty: IsEmpty<PartnersComponentSchema, PartnerDetails[]> = (_component, value) => {
  return value === undefined || value.length === 0;
};

export default isEmpty;
