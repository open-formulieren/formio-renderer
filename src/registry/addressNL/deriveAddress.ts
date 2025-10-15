import type {AddressData} from '@open-formulieren/types';
import {useFormikContext} from 'formik';
import {useEffect, useState} from 'react';
import {useAsync} from 'react-use';

import {useDebounce, useFormSettings} from '@/hooks';

import type {FormValues} from './types';
import {DEFAULT_POSTCODE_REGEX, HOUSE_NUMBER_REGEX} from './validationSchema';

interface UseDeriveAddress {
  enableManualEntry: boolean;
}

const testValidInputs = (postcode: string, houseNumber: string): boolean => {
  const validPostcode = DEFAULT_POSTCODE_REGEX.test(postcode);
  const validHouseNumber = HOUSE_NUMBER_REGEX.test(houseNumber);
  return Boolean(validPostcode && validHouseNumber);
};

export const useDeriveAddress = (key: string, enabled: boolean): UseDeriveAddress => {
  const {getFieldProps, setFieldValue} = useFormikContext<FormValues>();
  const {value} = getFieldProps<AddressData>(key);
  const formSettings = useFormSettings();
  const [enableManualEntry, setEnableManualEntry] = useState<boolean>(false);

  const doAddressAutoComplete = formSettings?.componentParameters?.addressNL?.addressAutoComplete;
  // if no address lookup callback is available, only manual edits are possible.
  if (!doAddressAutoComplete && !enableManualEntry) {
    setEnableManualEntry(true);
  }

  const skipAutoFill = !enabled || !doAddressAutoComplete;

  // debounce to avoid rapidly firing updates when the user is typing
  const addressData = useDebounce(value, 300);
  const {postcode, houseNumber} = addressData;

  // if postcode/house number change, check if we need to clear the derived inputs
  useEffect(() => {
    // nothing to do if address auto fill is not enabled
    if (skipAutoFill) return;
    const validInputs = testValidInputs(postcode, houseNumber);
    // clear the derived fields for invalid input data to make it clear we haven't
    // autofilled anything
    if (!validInputs && !enableManualEntry) {
      setFieldValue(`${key}.streetName`, '');
      setFieldValue(`${key}.city`, '');
      setFieldValue(`${key}.autoPopulated`, false);
      return;
    }
  }, [key, setFieldValue, skipAutoFill, postcode, houseNumber, enableManualEntry]);

  // if postcode/house number change, look up the address details again
  useAsync(async () => {
    // nothing to do if address auto fill is not enabled
    if (skipAutoFill) return;

    // test if we have workable input data and only do the lookup if we do
    if (!testValidInputs(postcode, houseNumber)) return;

    const result = await doAddressAutoComplete(postcode, houseNumber);
    // lookup errored -> enable manual edit so that users can continue with form submission
    if (result === null) {
      setEnableManualEntry(true);
      setFieldValue(`${key}.secretStreetCity`, '');
      setFieldValue(`${key}.autoPopulated`, false);
    } else {
      // TODO: enable manual edit if the component is configured and both city + street
      // name are the empty string (then disable autoPopulated!)
      setEnableManualEntry(false);
      setFieldValue(`${key}.streetName`, result.streetName);
      setFieldValue(`${key}.city`, result.city);
      setFieldValue(`${key}.secretStreetCity`, result.secretStreetCity);
      setFieldValue(`${key}.autoPopulated`, true);
    }
  }, [key, setFieldValue, doAddressAutoComplete, skipAutoFill, postcode, houseNumber]);

  return {enableManualEntry};
};
