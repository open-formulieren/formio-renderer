import type {SignatureComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';

const getInitialValues: GetInitialValues<SignatureComponentSchema, string> = ({
  key,
  defaultValue,
}: SignatureComponentSchema) => {
  // if no default value is explicitly specified, return the empty value
  if (defaultValue === undefined) {
    defaultValue = '';
  }
  return {[key]: defaultValue};
};

export default getInitialValues;
