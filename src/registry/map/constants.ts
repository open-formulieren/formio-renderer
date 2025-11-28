import type {MapComponentSchema} from '@open-formulieren/types';

// backwards compatible interaction fallback
export const DEFAULT_INTERACTIONS: Exclude<MapComponentSchema['interactions'], undefined> = {
  polygon: false,
  polyline: false,
  marker: true,
};
