import type {ManuallyAddedChildDetails} from '@/registry/children/types';

export const EMPTY_CHILD = {
  bsn: '',
  firstNames: '',
  dateOfBirth: '',
  __addedManually: true,
} satisfies ManuallyAddedChildDetails;
