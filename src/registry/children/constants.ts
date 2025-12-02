import type {ChildDetails} from '@open-formulieren/types';

import type {ExtendedChildDetails} from './types';

export const EMPTY_CHILD: ExtendedChildDetails = {
  bsn: '',
  firstNames: '',
  dateOfBirth: '',
  _OF_INTERNAL_addedManually: true,
};

export const SUB_FIELD_NAMES: (keyof ChildDetails)[] = ['bsn', 'firstNames', 'dateOfBirth'];
