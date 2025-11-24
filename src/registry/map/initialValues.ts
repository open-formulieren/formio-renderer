import type {MapComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';
import type {JSONObject} from '@/types';

const getInitialValues: GetInitialValues<MapComponentSchema, JSONObject> = ({
  key,
  defaultValue,
}: MapComponentSchema) => ({[key]: defaultValue as unknown as JSONObject});

export default getInitialValues;
