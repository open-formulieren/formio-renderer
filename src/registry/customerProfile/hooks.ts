import type {CustomerProfileComponentSchema} from '@open-formulieren/types';
import type {DigitalAddress} from '@open-formulieren/types/dist/components/customerProfile';
import {useFormikContext} from 'formik';
import {useAsync} from 'react-use';

import {useVerificationStatus} from '@/components/forms/Verification/hooks';
import {useFormSettings} from '@/hooks';
import type {JSONObject} from '@/types';

import type {DigitalAddressesResponseBody} from './types';

interface UseDigitalAddresses {
  digitalAddresses: DigitalAddressesResponseBody | undefined;
  loading: boolean;
}

export const useDigitalAddresses = (
  profileComponentName: string,
  digitalAddressTypes: CustomerProfileComponentSchema['digitalAddressTypes']
): UseDigitalAddresses => {
  const {getFieldHelpers, getFieldMeta} = useFormikContext<JSONObject>();
  const {fetchDigitalAddresses} = useCustomerProfileComponentParameters();
  const {updateVerificationStatus} = useVerificationStatus();

  const {value: digitalAddresses, loading} = useAsync(async () => {
    const result = await fetchDigitalAddresses(profileComponentName);
    if (!result) {
      return [];
    }

    digitalAddressTypes.forEach((type, index) => {
      const profileComponentKey = `${profileComponentName}.${index}`;
      const {value} = getFieldMeta<DigitalAddress>(profileComponentKey);
      const {setValue} = getFieldHelpers<DigitalAddress>(profileComponentKey);

      const addressData = result.find(address => address.type === type);

      // Only set a default if there isn't already a value.
      if (!value?.address) {
        // The default value is the preferred address or the first address in the list.
        // If neither is present, the default value is an empty string.
        const defaultAddress = addressData?.preferred || addressData?.options?.[0]?.address || '';

        setValue({
          address: defaultAddress,
          type,
          preferenceUpdate: defaultAddress === '' ? 'useOnlyOnce' : undefined,
        });
      }

      // Only email preferences should update the verification state
      if (type !== 'email' || !addressData) return;

      const componentVerificationStatus = Object.fromEntries(
        addressData.options.map(({address, isVerified}) => [address, isVerified])
      );

      updateVerificationStatus(profileComponentName, componentVerificationStatus);
    });

    return result;
    // The dependency array is deliberately left empty as we don't want to re-fetch the
    // data. We assume that fetchDigitalAddresses and digitalAddressTypes are stable
    // and won't change during the lifetime of the component.
    // https://github.com/open-formulieren/formio-renderer/pull/213#discussion_r2564636570
  }, []);

  return {digitalAddresses, loading};
};

export const useCustomerProfileComponentParameters = () => {
  const {componentParameters} = useFormSettings();
  if (!componentParameters?.customerProfile) {
    throw new Error(
      `The 'customerProfile' component can only be used if fetchDigitalAddresses/portalUrl
      parameters are provided. Check that the componentParameters are passed correctly in
      the FormioForm call.`
    );
  }
  const {fetchDigitalAddresses, portalUrl, updatePreferencesModalEnabled} =
    componentParameters.customerProfile;
  return {fetchDigitalAddresses, portalUrl, updatePreferencesModalEnabled};
};
