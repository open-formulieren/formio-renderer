import type {PartnerDetails} from '@open-formulieren/types/dist/components/partners';

import type {ManuallyAddedPartnerDetails} from '@/registry/partners/types';

export const EMPTY_PARTNER = {
  bsn: '',
  initials: '',
  affixes: '',
  lastName: '',
  dateOfBirth: '',
  _OF_INTERNAL_addedManually: true,
} satisfies ManuallyAddedPartnerDetails;

export const SUB_FIELD_NAMES: (keyof PartnerDetails)[] = [
  'bsn',
  'initials',
  'affixes',
  'lastName',
  'dateOfBirth',
];
