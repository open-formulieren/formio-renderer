import type {CosignV2ComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';

const getInitialValues: GetInitialValues<CosignV2ComponentSchema, string> = ({
  key,
  defaultValue,
}: CosignV2ComponentSchema) => {
  // if no default value is explicitly specified, return the empty value
  if (defaultValue === undefined) {
    defaultValue = '';
  }
  return {[key]: defaultValue};
};

export default getInitialValues;
