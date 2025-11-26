import type {CustomerProfileComponentSchema, CustomerProfileData} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';

const getInitialValues: GetInitialValues<
  CustomerProfileComponentSchema,
  CustomerProfileData | null
> = ({key, defaultValue, digitalAddressTypes}: CustomerProfileComponentSchema) => {
  if (defaultValue === undefined || !defaultValue?.length) {
    defaultValue = digitalAddressTypes.map(type => ({
      type,
      address: '',
      preferenceUpdate: 'useOnlyOnce',
    }));
  }
  return {[key]: defaultValue as unknown as CustomerProfileData};
};

export default getInitialValues;
