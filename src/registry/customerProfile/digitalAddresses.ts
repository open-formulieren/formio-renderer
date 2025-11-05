import type {CustomerProfileProperties} from '@open-formulieren/types';
import {useFormikContext} from 'formik';
import {useState} from 'react';
import {useAsync} from 'react-use';

import {useFormSettings} from '@/hooks';
import type {FormValues} from '@/registry/addressNL/types';

import type {DigitalAddressesResponseBody} from './types';

interface UseDigitalAddresses {
  digitalAddresses: DigitalAddressesResponseBody;
}

export const useDigitalAddresses = (
  key: string,
  digitalAddressTypes: CustomerProfileProperties['digitalAddressTypes']
): UseDigitalAddresses => {
  const {setFieldValue} = useFormikContext<FormValues>();
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
      return;
    }

    // Set the default values for all fetched digital addresses.
    Object.entries(result).forEach(([addressType, addressData]) => {
      // The default value is the preferred address or the first address in the list.
      setFieldValue(`${key}.${addressType}`, addressData.preferred ?? addressData.addresses[0]);
    });

    setDigitalAddresses(result);
  }, [fetchDigitalAddresses, digitalAddressTypes, setDigitalAddresses]);

  return {digitalAddresses};
};
