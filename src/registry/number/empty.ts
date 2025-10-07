import type {NumberComponentSchema} from '@open-formulieren/types';

import type {IsEmpty} from '@/registry/types';

const isEmpty: IsEmpty<NumberComponentSchema, number> = (_component, value) => {
  // Similar to Formio generic isEmpty https://github.com/formio/formio.js/blob/29939fc9d66f2b95527c90d3cf7729570c3d3010/src/components/_classes/component/Component.js#L3757
  return value === undefined || value.toString().trim().length === 0;
};

export default isEmpty;
