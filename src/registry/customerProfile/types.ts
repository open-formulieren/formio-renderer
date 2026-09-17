import type {
  DigitalAddress,
  DigitalAddressType,
} from '@open-formulieren/types/dist/components/customerProfile';

import type {VerificationParameters} from '@/components/forms/Verification/types';

export type CustomerProfileData = DigitalAddress[];

export interface CommunicationPreference {
  address: string;
  verificationDate: string | null;
}

/**
 * A subset of the Formik state/values, scoped to the data belonging to the
 * CustomerProfile component.
 *
 * The string key index matches the `component.key` type, which *could* be a string with
 * periods, creating a nested object structure.
 */
export type FormValues = {
  [k: string]: CustomerProfileData | FormValues;
};

export interface DigitalAddressGroup {
  type: DigitalAddressType;
  options: CommunicationPreference[];
  preferred?: string;
}

export type DigitalAddressesResponseBody = DigitalAddressGroup[];

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
export interface CustomerProfileParameters extends VerificationParameters {
  fetchDigitalAddresses: (
    profileComponentName: string
  ) => Promise<DigitalAddressesResponseBody | null>;
  portalUrl: string;
  updatePreferencesModalEnabled: boolean;
}
