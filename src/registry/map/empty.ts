import type {MapComponentSchema} from '@open-formulieren/types';

import type {IsEmpty} from '@/registry/types';
import type {JSONObject} from '@/types';

const isEmpty: IsEmpty<MapComponentSchema, null | JSONObject> = (_componentDefinition, value) => {
  if (!value) return true;
  return false;
};

export default isEmpty;
