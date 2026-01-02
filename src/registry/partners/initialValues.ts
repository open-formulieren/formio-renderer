import type {PartnersComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';
import type {JSONValue} from '@/types';

const getInitialValues: GetInitialValues<PartnersComponentSchema, JSONValue[]> = ({
  key,
}: PartnersComponentSchema) => {
  return {[key]: []};
};

export default getInitialValues;
