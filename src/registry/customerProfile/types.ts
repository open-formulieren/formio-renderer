import type {CustomerProfileProperties, DigitalAddressType} from '@open-formulieren/types';

export interface DigitalAddressGroup {
  addresses: string[];
  preferred?: string;
}

export type DigitalAddressesResponseBody = Partial<Record<DigitalAddressType, DigitalAddressGroup>>;

/**
 * Dependency injection parameters for the customer profile component.
 *
 * Provides handlers for fetching customer communication addresses and preferences,
 * and the portal URL where users can manage their communication preferences.
 *
 * We assume that `fetchDigitalAddresses` is a stable resource and will not change
 * during the lifetime of the application. If it does change, the customer profile
 * component won't automatically re-fetch the data.
 * https://github.com/open-formulieren/formio-renderer/pull/213#discussion_r2564636570
 */
export interface CustomerProfileParameters {
  fetchDigitalAddresses: (
    submissionId: string,
    digitalAddressTypes: CustomerProfileProperties['digitalAddressTypes']
  ) => Promise<DigitalAddressesResponseBody | null>;
  portalUrl: string;
}
