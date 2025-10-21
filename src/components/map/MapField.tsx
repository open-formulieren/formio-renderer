import type {CoordinatePair, GeoJsonGeometry, MapComponentSchema} from '@open-formulieren/types';
import {FormField} from '@utrecht/component-library-react';
import {useField} from 'formik';
import * as L from 'leaflet';
import {useEffect, useId, useRef} from 'react';
import {useIntl} from 'react-intl';
import {FeatureGroup, MapContainer, TileLayer, useMap} from 'react-leaflet';
import {EditControl} from 'react-leaflet-draw';

import {HelpText} from '@/components/forms';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import {useFieldConfig} from '@/hooks';

import {overloadLeafletDeleteControl} from './DeleteControl';
import LayersControl from './LeafletMapLayersControl';
import LocationControl from './LeafletMapLocationControl';
import SearchControl from './LeafletMapSearchControl';
import type {GeoSearchShowLocationEvent} from './LeafletMapSearchControl';
import './MapField.scss';
import NearestAddress from './NearestAddress';
import {DEFAULT_CENTER_COORDINATES, DEFAULT_INTERACTIONS, DEFAULT_ZOOM_LEVEL} from './constants';
import {overloadLeafletDrawPolylineControl} from './drawPolylineControl';
import {CRS_RD, TILE_LAYER_RD, initialize} from './init';
import {
  applyLeafletTranslations,
  leafletGestureHandlingText,
  searchControlMessages,
} from './translations';
import type {Interactions} from './types';

initialize();

export interface MapFieldProps {
  /**
   * The name of the form field/input, used to set/track the field value in the form state.
   */
  name: string;
  /**
   * The (accessible) label for the field - anything that can be rendered.
   *
   * You must always provide a label to ensure the field is accessible to users of
   * assistive technologies.
   */
  label: React.ReactNode;
  /**
   * Disabled fields get marked as such in an accessible manner.
   */
  isDisabled?: boolean;
  /**
   * Additional description displayed close to the field - use this to document any
   * validation requirements that are crucial to successfully submit the form. More
   * information that is contextual/background typically belongs in a tooltip.
   */
  description?: React.ReactNode;
  /**
   * Optional tooltip to provide additional information that is not crucial but may
   * assist users in filling out the field correctly.
   */
  tooltip?: React.ReactNode;
  /**
   * Optional initial point where the map will center around.
   */
  defaultCenter?: CoordinatePair;
  /**
   * Optional initial zoom level.
   * Leaflet zoom level is a range of 1-20, but the Dutch tile service only supports up
   * to level 13.
   */
  defaultZoomLevel?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
  /**
   * URL to the tile layer which should be used.
   */
  tileLayerUrl?: string;
  /**
   * Additional element which will be used as child element of the MapField.
   */
  mapContainerChild?: React.ReactNode;
  /**
   * The interaction(s) to use for the map.
   */
  interactions?: MapComponentSchema['interactions'];
  /**
   * The overlay(s) to use for the map.
   */
  overlays?: MapComponentSchema['overlays'];
}

const MapField: React.FC<MapFieldProps> = ({
  name,
  label = '',
  description = '',
  isDisabled = false,
  tooltip,
  defaultCenter = DEFAULT_CENTER_COORDINATES,
  defaultZoomLevel = DEFAULT_ZOOM_LEVEL,
  tileLayerUrl = TILE_LAYER_RD.url,
  mapContainerChild,
  interactions = DEFAULT_INTERACTIONS,
  overlays,
}) => {
  name = useFieldConfig(name);
  const [{value}, , {setValue}] = useField<null | GeoJsonGeometry>(name);
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const id = useId();
  const intl = useIntl();

  const center: L.LatLng | null = value ? L.geoJSON(value).getBounds().getCenter() : null;
  const coordinates: CoordinatePair | null = center ? [center.lat, center.lng] : null;

  // Get the names of the active interactions
  const activeInteractionNames = Object.entries(interactions)
    .filter(([, allow]) => !!allow)
    .map<keyof Interactions>(([interaction]) => interaction as keyof Interactions);
  const singleInteractionMode = activeInteractionNames.length === 1;

  useEffect(() => {
    applyLeafletTranslations(intl);
  }, [intl]);

  useEffect(() => {
    overloadLeafletDeleteControl(featureGroupRef, intl);
  }, [featureGroupRef, intl]);

  useEffect(() => {
    overloadLeafletDrawPolylineControl();
  }, []);

  const onFeatureCreate = (event: L.DrawEvents.Created) => {
    updateGeoJsonGeometry(event.layer);
  };

  const onFeatureDelete = () => {
    // The value `null` is needed to make sure that Formio actually updates the value.
    // node_modules/formiojs/components/_classes/component/Component.js:2528
    setValue(null);
  };

  const onSearchMarkerSet = (event: GeoSearchShowLocationEvent) => {
    updateGeoJsonGeometry(event.marker);
  };

  const updateGeoJsonGeometry = (
    newFeatureLayer: L.Circle | L.CircleMarker | L.Marker | L.Polygon | L.Polyline
  ) => {
    // Remove all existing shapes from the map, ensuring that shapes are only added through
    // `geoJsonGeometry` changes.
    featureGroupRef.current?.clearLayers();
    setValue(newFeatureLayer.toGeoJSON().geometry);
  };

  return (
    <FormField className="utrecht-form-field--openforms">
      <Label isDisabled={isDisabled} tooltip={tooltip ? <Tooltip>{tooltip}</Tooltip> : undefined}>
        {label}
      </Label>

      <MapContainer
        id={id}
        center={defaultCenter}
        zoom={defaultZoomLevel}
        minZoom={TILE_LAYER_RD.minZoom}
        maxZoom={TILE_LAYER_RD.maxZoom}
        crs={CRS_RD}
        attributionControl
        // @ts-expect-error searchControl, gestureHandling and gestureHandlingOptions are
        // missing in the props definitions, but definitely being used.
        searchControl
        gestureHandling
        gestureHandlingOptions={{
          text: {
            touch: intl.formatMessage(leafletGestureHandlingText.touch),
            scroll: intl.formatMessage(leafletGestureHandlingText.scroll),
            scrollMac: intl.formatMessage(leafletGestureHandlingText.scrollMac),
          },
          duration: 3000,
        }}
        className={
          isDisabled
            ? 'openforms-leaflet-map openforms-leaflet-map--disabled'
            : 'openforms-leaflet-map'
        }
      >
        <EnsureTestId />
        <TileLayer {...TILE_LAYER_RD} url={tileLayerUrl} />

        <LayersControl overlays={overlays} withoutControl={isDisabled} />

        {
          <FeatureGroup ref={featureGroupRef}>
            {!isDisabled && (
              <>
                {singleInteractionMode && (
                  <SingleInteractionMode shape={activeInteractionNames[0]} />
                )}

                <EditControl
                  position="topright"
                  onCreated={onFeatureCreate}
                  onDeleted={onFeatureDelete}
                  edit={{
                    edit: false,
                  }}
                  draw={{
                    rectangle: false,
                    circle: false,
                    // Add the draw buttons when there is more than 1 active interaction.
                    polyline: !singleInteractionMode && !!interactions?.polyline,
                    polygon: !singleInteractionMode && !!interactions?.polygon,
                    marker: !singleInteractionMode && !!interactions?.marker,
                    circlemarker: false,
                  }}
                />
              </>
            )}
            <Geometry geoJsonGeometry={value ?? undefined} featureGroupRef={featureGroupRef} />
          </FeatureGroup>
        }

        {!isDisabled && (
          <>
            <SearchControl
              onMarkerSet={onSearchMarkerSet}
              options={{
                showMarker: false,
                showPopup: false,
                retainZoomLevel: false,
                animateZoom: true,
                autoClose: false,
                searchLabel: intl.formatMessage(searchControlMessages.searchLabel),
                keepResult: true,
                updateMap: true,
                notFoundMessage: intl.formatMessage(searchControlMessages.notFound),
              }}
            />
            <LocationControl />
          </>
        )}
        {coordinates && <MapView coordinates={coordinates} />}
        {isDisabled && <DisabledMapControls />}

        {mapContainerChild}
      </MapContainer>
      {coordinates && coordinates.length && <NearestAddress coordinates={coordinates} />}

      <HelpText>{description}</HelpText>
    </FormField>
  );
};

// For storybook usage
const EnsureTestId = () => {
  const map = useMap();
  const container = map.getContainer();
  useEffect(() => {
    if (!container.dataset.testid) {
      container.dataset.testid = 'leaflet-map';
    }
  }, [container]);
  return null;
};

interface SingleInteractionModeProps {
  shape: keyof Interactions;
}

const SingleInteractionMode: React.FC<SingleInteractionModeProps> = ({shape}) => {
  const map = useMap();
  const drawHandlerRef = useRef<L.Draw.Feature | null>(null);

  useEffect(() => {
    if (!map) return;

    const getDrawHandler = (): L.Draw.Marker | L.Draw.Polygon | L.Draw.Polyline | null => {
      switch (shape) {
        case 'marker':
          return new L.Draw.Marker(map as L.DrawMap);
        case 'polygon':
          return new L.Draw.Polygon(map as L.DrawMap);
        case 'polyline':
          return new L.Draw.Polyline(map as L.DrawMap);
        default:
          return null;
      }
    };

    // Get draw handler
    drawHandlerRef.current = getDrawHandler();

    // Enable drawing mode
    drawHandlerRef.current?.enable();

    // Cancel drawing on 'right-click'
    map.on('contextmenu', () => {
      drawHandlerRef.current?.disable();

      // After canceling the currect drawing, get a new handler to allow a new drawing.
      drawHandlerRef.current = getDrawHandler();
      drawHandlerRef.current?.enable();
    });

    return () => {
      drawHandlerRef.current?.disable();
    };
    // Re-enable drawing mode when the shape, the map, or the current geojson changes.
  }, [shape, map]);

  return null;
};

interface GeometryProps {
  geoJsonGeometry?: GeoJsonGeometry;
  featureGroupRef: React.RefObject<L.FeatureGroup>;
}

export const Geometry: React.FC<GeometryProps> = ({geoJsonGeometry, featureGroupRef}) => {
  const map = useMap();

  useEffect(() => {
    if (!featureGroupRef.current) {
      // If there is no feature group, nothing should be done...
      return;
    }

    // Remove all shapes from the map.
    // Only the data from `geoJsonGeometry` should be shown on the map.
    featureGroupRef.current.clearLayers();
    if (!geoJsonGeometry) {
      return;
    }

    // Add the `geoJsonGeometry` data as shape.
    const layer = L.GeoJSON.geometryToLayer({
      type: 'Feature',
      geometry: geoJsonGeometry,
      properties: {},
    });
    featureGroupRef.current.addLayer(layer);

    // For marker/point elements the zooming doesn't provide any functionality, as it
    // cannot be outside the bounds.
    if (geoJsonGeometry.type !== 'Point') {
      // Update map zoom to fit the shape
      map.fitBounds(L.geoJSON(geoJsonGeometry).getBounds(), {padding: [1, 1]});
    }
  }, [featureGroupRef, geoJsonGeometry, map]);

  return null;
};

interface MapViewProps {
  coordinates?: CoordinatePair;
}

export const MapView: React.FC<MapViewProps> = ({coordinates = null}) => {
  const map = useMap();
  useEffect(() => {
    if (!coordinates) return;
    if (coordinates.filter(value => isFinite(value)).length !== 2) return;
    map.setView(coordinates);
  }, [map, coordinates]);

  // rendering is done by leaflet, so just return null
  return null;
};

export const DisabledMapControls = () => {
  const map = useMap();
  useEffect(() => {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.tapHold?.disable();
  }, [map]);
  return null;
};

export default MapField;
