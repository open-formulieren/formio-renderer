import type {CustomerProfileProperties} from '@open-formulieren/types';
import {useFormikContext} from 'formik';
import {useState} from 'react';
import {useAsync} from 'react-use';

import {useFormSettings} from '@/hooks';
import type {FormValues} from '@/registry/addressNL/types';

import type {DigitalAddresses} from './types';

interface UseDeriveAddress {
  digitalAddresses: DigitalAddresses;
}

export const useDigitalAddresses = (
  key: string,
  digitalAddressTypes: CustomerProfileProperties['digitalAddressTypes']
): UseDeriveAddress => {
  const {setFieldValue} = useFormikContext<FormValues>();
  const formSettings = useFormSettings();
  const [digitalAddresses, setDigitalAddresses] = useState<DigitalAddresses>({});

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

    // If we have a preferred email or phone number, set it in the form.
    if (result.preferredEmail) {
      setFieldValue(`${key}.email`, result.preferredEmail);
    }
    if (result.preferredPhoneNumber) {
      setFieldValue(`${key}.phoneNumber`, result.preferredPhoneNumber);
    }

    setDigitalAddresses(result);
  }, [fetchDigitalAddresses, digitalAddressTypes, setDigitalAddresses]);

  return {digitalAddresses};
};
