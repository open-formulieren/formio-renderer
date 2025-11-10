import type {DigitalAddress} from '@open-formulieren/types';

export const DIGITAL_ADDRESS_FIELD_NAMES: (keyof DigitalAddress)[] = [
  'address',
  'useOnlyOnce',
  'isNewPreferred',
];
