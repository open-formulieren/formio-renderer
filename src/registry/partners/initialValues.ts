import type {PartnersComponentSchema} from '@open-formulieren/types';
import {PartnerDetails} from '@open-formulieren/types/lib/formio/components/partners';

import type {GetInitialValues} from '@/registry/types';

const getInitialValues: GetInitialValues<PartnersComponentSchema, PartnerDetails[]> = ({
  key,
  defaultValue,
}: PartnersComponentSchema) => {
  // if no default value is explicitly specified, return the empty value
  if (defaultValue === undefined) {
    defaultValue = [];
  }
  return {[key]: defaultValue};
};

export default getInitialValues;
