import {type MapValue} from '@open-formulieren/types';

import {type Interactions} from './types';

export const DEFAULT_CENTER_COORDINATES: MapValue = [52.1326332, 5.291266];
export const DEFAULT_ZOOM_LEVEL = 13;
export const DEFAULT_INTERACTIONS: Interactions = {
  marker: true,
  polygon: false,
  polyline: false,
};
