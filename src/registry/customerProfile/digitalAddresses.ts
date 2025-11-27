import type {
  CustomerProfileData,
  CustomerProfileProperties,
  DigitalAddress,
  DigitalAddressType,
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
  profileComponentKey: string,
  digitalAddressTypes: CustomerProfileProperties['digitalAddressTypes']
): UseDigitalAddresses => {
  const {setFieldValue} = useFormikContext<CustomerProfileData>();
  const formSettings = useFormSettings();
  const [digitalAddresses, setDigitalAddresses] = useState<DigitalAddressesResponseBody>([]);

  if (!formSettings?.componentParameters?.customerProfile) {
    throw new Error('Customer profile component parameters not configured');
  }

  const {fetchDigitalAddresses} = formSettings.componentParameters.customerProfile;

  useAsync(async () => {
    const result = await fetchDigitalAddresses(profileComponentKey);
    if (!result) {
      // Initial the form with empty values if fetch failed.
      digitalAddressTypes.forEach((type, index) => {
        setFieldValue(`${profileComponentKey}.${index}`, {
          address: '',
          type: type,
          useOnlyOnce: true,
        } satisfies DigitalAddress);
      });
      setDigitalAddresses([]);
      return;
    }

    const addressesResultMap: Partial<Record<DigitalAddressType, DigitalAddressGroup>> =
      Object.fromEntries(result.map(addressGroup => [addressGroup.type, addressGroup]));

    digitalAddressTypes.forEach((type, index) => {
      const addressData: DigitalAddressGroup | undefined = addressesResultMap[type];
      // The default value is the preferred address or the first address in the list.
      const defaultAddress = !addressData
        ? ''
        : (addressData.preferred ?? addressData.addresses[0] ?? '');

      setFieldValue(`${profileComponentKey}.${index}`, {
        address: defaultAddress,
        type: type,
        useOnlyOnce: defaultAddress === '' ? true : undefined,
      } satisfies DigitalAddress);
    });

    setDigitalAddresses(result);
  }, [fetchDigitalAddresses, digitalAddressTypes, setDigitalAddresses]);

  return {digitalAddresses};
};
