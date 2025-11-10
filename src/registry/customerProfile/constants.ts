import type {CustomerProfileData, DigitalAddress} from '@open-formulieren/types';

export const SUB_FIELD_NAMES: (keyof CustomerProfileData)[] = ['email', 'phoneNumber'];
export const DIGITAL_ADDRESS_SUB_FIELD_NAMES: (keyof DigitalAddress)[] = [
  'address',
  'useOnlyOnce',
  'isNewPreferred',
];
