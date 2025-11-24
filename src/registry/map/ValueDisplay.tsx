import type {GeoJsonGeometry, MapComponentSchema} from '@open-formulieren/types';

import LeafletMap from '@/components/map';

export interface ValueDisplayProps {
  componentDefinition: MapComponentSchema;
  value: GeoJsonGeometry | undefined;
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({componentDefinition, value}) => {
  const {defaultZoom, initialCenter, tileLayerUrl, overlays} = componentDefinition;

  if (!value) return null;

  return (
    <LeafletMap
      geoJsonGeometry={value}
      defaultZoomLevel={defaultZoom ?? undefined}
      tileLayerUrl={tileLayerUrl}
      defaultCenter={
        initialCenter && initialCenter.lng && initialCenter.lat
          ? [initialCenter.lat, initialCenter.lng]
          : undefined
      }
      overlays={overlays}
    />
  );
};

export default ValueDisplay;
