import type {PartnerDetails} from '@open-formulieren/types';

import type {ManuallyAddedPartnerDetails} from '@/registry/partners/types';

export const EMPTY_PARTNER = {
  bsn: '',
  initials: '',
  affixes: '',
  lastName: '',
  dateOfBirth: '',
  __addedManually: true,
} satisfies ManuallyAddedPartnerDetails;

export const SUB_FIELD_NAMES: (keyof PartnerDetails)[] = [
  'bsn',
  'initials',
  'affixes',
  'lastName',
  'dateOfBirth',
];
