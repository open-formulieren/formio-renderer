import type {DigitalAddressType} from '@open-formulieren/types';

export interface DigitalAddressGroup {
  type: DigitalAddressType;
  addresses: string[];
  preferred?: string;
}

export type DigitalAddressesResponseBody = DigitalAddressGroup[];

export interface CustomerProfileParameters {
  fetchDigitalAddresses: (
    profileComponentName: string
  ) => Promise<DigitalAddressesResponseBody | null>;
  portalUrl: string;
}
