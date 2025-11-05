import type {CustomerProfileProperties} from '@open-formulieren/types';

export interface DigitalAddresses {
  emails?: string[];
  phoneNumbers?: string[];
  preferredEmail?: string;
  preferredPhoneNumber?: string;
}

export interface CustomerProfileParameters {
  fetchDigitalAddresses: (
    submissionId: string,
    digitalAddressTypes: CustomerProfileProperties['digitalAddressTypes']
  ) => Promise<DigitalAddresses | null>;
}
