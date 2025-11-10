import type {ExtendedChildDetails} from './types';

export const EMPTY_CHILD = {
  bsn: '',
  firstNames: '',
  dateOfBirth: '',
  __addedManually: true,
} satisfies ExtendedChildDetails;
