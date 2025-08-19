import type {EditGridComponentSchema} from '@open-formulieren/types';

import {IsEmpty} from '@/registry/types';
import {JSONObject} from '@/types';

const isEmpty: IsEmpty<EditGridComponentSchema, JSONObject[]> = (_componentDefinition, value) => {
  // Similar to Formio generic isEmpty https://github.com/formio/formio.js/blob/29939fc9d66f2b95527c90d3cf7729570c3d3010/src/components/_classes/component/Component.js#L3757
  // The value of an editgrid component must be an array with 1 or more entries.
  const hasValue = Array.isArray(value) && value.length >= 1;
  return !hasValue;
};

export default isEmpty;
