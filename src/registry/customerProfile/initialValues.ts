import type {
  CustomerProfileComponentSchema,
  CustomerProfileData,
  DigitalAddress,
} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';

function assertNotArrayOfArray(
  value: CustomerProfileData | CustomerProfileData[]
): asserts value is CustomerProfileData {
  // test if any item inside the array is an Array, indicating nested arrays
  if (value.some(child => Array.isArray(child))) {
    throw new TypeError('An array of arrays is not supported and should not happen.');
  }
}

const getInitialValues: GetInitialValues<
  CustomerProfileComponentSchema,
  CustomerProfileData | null
> = ({
  key,
  defaultValue = [] satisfies CustomerProfileData,
  digitalAddressTypes,
}: CustomerProfileComponentSchema) => {
  // Only validate when the value is non-null
  if (defaultValue != null) {
    // side-effect of the generic types in formio components, but realistically we don't
    // expect any defaultValue to ever be set.
    assertNotArrayOfArray(defaultValue);
  }

  if (defaultValue == null || !defaultValue?.length) {
    defaultValue = digitalAddressTypes.map(
      type =>
        ({
          type,
          address: '',
          preferenceUpdate: 'useOnlyOnce',
        }) satisfies DigitalAddress
    );
  }
  return {[key]: defaultValue};
};

export default getInitialValues;
