import type {MapComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';
import type {JSONObject} from '@/types';

const getInitialValues: GetInitialValues<MapComponentSchema, JSONObject | null> = ({
  key,
  defaultValue = null,
}: MapComponentSchema) => ({[key]: defaultValue as unknown as JSONObject});

export default getInitialValues;
