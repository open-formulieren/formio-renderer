import type {MapComponentSchema, MapValue} from '@open-formulieren/types';

interface PointGeometry {
  type: 'Point';
  coordinates: MapValue;
}

interface LineGeometry {
  type: 'LineString';
  coordinates: MapValue[];
}

interface PolygonGeometry {
  type: 'Polygon';
  coordinates: MapValue[][];
}

export type Overlay = NonNullable<MapComponentSchema['overlays']>[number];
export type GeoJsonGeometry = PointGeometry | LineGeometry | PolygonGeometry;
export type Interactions = Required<MapComponentSchema>['interactions'];
