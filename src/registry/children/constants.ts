import type {ChildDetails} from '@open-formulieren/types';

import type {ExtendedChildDetails} from './types';

export const EMPTY_CHILD = {
  bsn: '',
  firstNames: '',
  dateOfBirth: '',
  __addedManually: true,
} satisfies ExtendedChildDetails;

export const SUB_FIELD_NAMES: (keyof ChildDetails)[] = ['bsn', 'firstNames', 'dateOfBirth'];
