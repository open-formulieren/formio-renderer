import type {AddressData} from '@open-formulieren/types/dist/components/addressNL';

export const SUB_FIELD_NAMES: (keyof AddressData)[] = [
  'postcode',
  'houseNumber',
  'houseLetter',
  'houseNumberAddition',
  'streetName',
  'city',
];
