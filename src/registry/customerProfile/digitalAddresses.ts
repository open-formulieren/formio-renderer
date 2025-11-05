import type {
  CustomerProfileData,
  CustomerProfileProperties,
  DigitalAddress,
} from '@open-formulieren/types';
import {useFormikContext} from 'formik';
import {useState} from 'react';
import {useAsync} from 'react-use';

import {useFormSettings} from '@/hooks';

import type {DigitalAddressGroup, DigitalAddressesResponseBody} from './types';

interface UseDigitalAddresses {
  digitalAddresses: DigitalAddressesResponseBody;
}

export const useDigitalAddresses = (
  profileComponentName: string,
  digitalAddressTypes: CustomerProfileProperties['digitalAddressTypes']
): UseDigitalAddresses => {
  const {setFieldValue} = useFormikContext<CustomerProfileData>();
  const formSettings = useFormSettings();
  const [digitalAddresses, setDigitalAddresses] = useState<DigitalAddressesResponseBody>({});

  if (!formSettings?.componentParameters?.customerProfile) {
    throw new Error('Customer profile component parameters not configured');
  }

  const {fetchDigitalAddresses} = formSettings.componentParameters.customerProfile;

  useAsync(async () => {
    // @TODO get submission id from form context?
    const result = await fetchDigitalAddresses('123', digitalAddressTypes);
    if (!result) {
      // Initial the form with empty values if fetch failed.
      digitalAddressTypes.forEach((type, index) => {
        setFieldValue(`${profileComponentName}.${index}`, {
          address: '',
          type: type,
          useOnlyOnce: true,
        } satisfies DigitalAddress);
      });
      return;
    }

    digitalAddressTypes.forEach((type, index) => {
      const addressData: DigitalAddressGroup = result[type] ?? {preferred: '', addresses: []};
      // The default value is the preferred address or the first address in the list.
      const defaultAddress = addressData.preferred ?? addressData.addresses[0] ?? '';

      setFieldValue(`${profileComponentName}.${index}`, {
        address: defaultAddress,
        type: type,
        useOnlyOnce: defaultAddress === '' ? true : undefined,
      } satisfies DigitalAddress);
    });

    setDigitalAddresses(result);
  }, [fetchDigitalAddresses, digitalAddressTypes, setDigitalAddresses]);

  return {digitalAddresses};
};
