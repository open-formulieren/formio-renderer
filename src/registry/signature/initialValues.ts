import type {SignatureComponentSchema} from '@open-formulieren/types';
import type {SignatureValue} from '@open-formulieren/types/dist/components/signature';

import type {GetInitialValues} from '@/registry/types';

const getInitialValues: GetInitialValues<SignatureComponentSchema, SignatureValue | ''> = ({
  key,
}: SignatureComponentSchema) => {
  return {[key]: ''};
};

export default getInitialValues;
