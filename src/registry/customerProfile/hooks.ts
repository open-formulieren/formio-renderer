import type {CustomerProfileProperties, DigitalAddress} from '@open-formulieren/types';
import {useFormikContext} from 'formik';
import {useAsync} from 'react-use';

import {useFormSettings} from '@/hooks';
import type {JSONObject} from '@/types';

import type {DigitalAddressesResponseBody} from './types';

interface UseDigitalAddresses {
  digitalAddresses: DigitalAddressesResponseBody | undefined;
  loading: boolean;
}

export const useDigitalAddresses = (
  profileComponentName: string,
  digitalAddressTypes: CustomerProfileProperties['digitalAddressTypes']
): UseDigitalAddresses => {
  const {getFieldHelpers} = useFormikContext<JSONObject>();
  const {fetchDigitalAddresses} = useCustomerProfileComponentParameters();

  const {value: digitalAddresses, loading} = useAsync(async () => {
    const result = await fetchDigitalAddresses(profileComponentName);
    if (!result) {
      return [];
    }

    digitalAddressTypes.forEach((type, index) => {
      const profileComponentKey = `${profileComponentName}.${index}`;
      const {setValue} = getFieldHelpers<DigitalAddress>(profileComponentKey);

      const addressData = result.find(address => address.type === type);
      // The default value is the preferred address or the first address in the list.
      // If neither is present, the default value is an empty string.
      const defaultAddress = addressData?.preferred || addressData?.addresses?.[0] || '';

      setValue({
        address: defaultAddress,
        type: type,
        preferenceUpdate: defaultAddress === '' ? 'useOnlyOnce' : undefined,
      });
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
  const {fetchDigitalAddresses, portalUrl} = componentParameters.customerProfile;
  return {fetchDigitalAddresses, portalUrl};
};
