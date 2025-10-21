import type {PartnerDetails, PartnersComponentSchema} from '@open-formulieren/types';

import type {IsEmpty} from '@/registry/types';

const isEmpty: IsEmpty<PartnersComponentSchema, Partial<PartnerDetails>[] | null> = (
  _component,
  value
) => {
  return value == null || value.length === 0;
};

export default isEmpty;
