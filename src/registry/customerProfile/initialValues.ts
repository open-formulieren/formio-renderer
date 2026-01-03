import type {CustomerProfileComponentSchema} from '@open-formulieren/types';
import type {DigitalAddress} from '@open-formulieren/types/dist/components/customerProfile';

import type {GetInitialValues} from '@/registry/types';

import type {CustomerProfileData} from './types';

const getInitialValues: GetInitialValues<
  CustomerProfileComponentSchema,
  CustomerProfileData | null
> = ({key, digitalAddressTypes}: CustomerProfileComponentSchema) => {
  const initialValue = digitalAddressTypes.map(
    type =>
      ({
        type,
        address: '',
        preferenceUpdate: 'useOnlyOnce',
      }) satisfies DigitalAddress
  );
  return {[key]: initialValue};
};

export default getInitialValues;
