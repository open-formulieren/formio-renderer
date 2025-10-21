import type {CoordinatePair, GeoJsonGeometry, MapComponentSchema} from '@open-formulieren/types';
import * as L from 'leaflet';
import {useRef} from 'react';
import {FeatureGroup, MapContainer, TileLayer} from 'react-leaflet';

import LayersControl from '@/components/map/LeafletMapLayersControl';
import {DisabledMapControls, Geometry, MapView} from '@/components/map/MapField';
import NearestAddress from '@/components/map/NearestAddress';
import {DEFAULT_ZOOM_LEVEL} from '@/components/map/constants';
import {CRS_RD, TILE_LAYER_RD, initialize} from '@/components/map/init';

export interface ValueDisplayProps {
  componentDefinition: MapComponentSchema;
  value: GeoJsonGeometry | undefined;
}

initialize();

const ValueDisplay: React.FC<ValueDisplayProps> = ({componentDefinition, value}) => {
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  if (!value) return null;

  const center: L.LatLng | undefined = value ? L.geoJSON(value).getBounds().getCenter() : undefined;
  const coordinates: CoordinatePair | null = center ? [center.lat, center.lng] : null;

  if (!coordinates) return null;

  return (
    <>
      <MapContainer
        zoom={componentDefinition.defaultZoom ?? DEFAULT_ZOOM_LEVEL}
        center={center}
        minZoom={TILE_LAYER_RD.minZoom}
        maxZoom={TILE_LAYER_RD.maxZoom}
        crs={CRS_RD}
        className={'openforms-leaflet-map openforms-leaflet-map--disabled'}
        attributionControl
      >
        <TileLayer {...TILE_LAYER_RD} url={componentDefinition.tileLayerUrl ?? TILE_LAYER_RD.url} />

        <LayersControl overlays={componentDefinition.overlays} />

        <FeatureGroup ref={featureGroupRef}>
          <Geometry geoJsonGeometry={value} featureGroupRef={featureGroupRef} />
        </FeatureGroup>

        <MapView coordinates={coordinates} />
        <DisabledMapControls />
      </MapContainer>
      {coordinates && coordinates.length && <NearestAddress coordinates={coordinates} />}
    </>
  );
};

export default ValueDisplay;
