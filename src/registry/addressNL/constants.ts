import type {AddressData} from '@open-formulieren/types';

export const SUB_FIELD_NAMES: (keyof AddressData)[] = [
  'postcode',
  'houseNumber',
  'houseLetter',
  'houseNumberAddition',
  'streetName',
  'city',
];
