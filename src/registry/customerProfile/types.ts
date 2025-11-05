import type {CustomerProfileProperties, DigitalAddressType} from '@open-formulieren/types';

export interface DigitalAddressGroup {
  addresses: string[];
  preferred?: string;
}

export type DigitalAddressesResponseBody = Partial<Record<DigitalAddressType, DigitalAddressGroup>>;

export interface CustomerProfileParameters {
  fetchDigitalAddresses: (
    submissionId: string,
    digitalAddressTypes: CustomerProfileProperties['digitalAddressTypes']
  ) => Promise<DigitalAddressesResponseBody | null>;
}
