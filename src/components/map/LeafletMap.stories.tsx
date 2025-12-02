import type {GeoJsonGeometry} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import type {Map as LMap} from 'leaflet';
import {useEffect, useState} from 'react';
import {useMap} from 'react-leaflet';
import {expect, fn, spyOn, userEvent, waitFor, within} from 'storybook/test';

import type {FormSettings} from '@/context';
import {withFormSettingsProvider} from '@/sb-decorators';
import MockProvider, {
  LOCATION_PERMISSIONS,
  getLocationPermission,
  withGeolocationMocking,
  withMapLayout,
} from '@/tests/map';

import LeafletMap from './LeafletMap';
import type {LeafletMapProps} from './LeafletMap';

// add our leaflet instrumentation to the global window object
declare global {
  interface Window {
    _OF_INTERNAL_leafletMap: LMap;
  }
}

const StorybookLeafletMapExposer = () => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      window._OF_INTERNAL_leafletMap = map;
    }
  }, [map]);
  return null;
};

const StorybookLeafletMap = (props: LeafletMapProps) => {
  const [geoJson, setGeoJson] = useState(props?.geoJsonGeometry);
  const handleGeoJsonChange = (args: GeoJsonGeometry) => {
    if (props?.onGeoJsonGeometrySet) {
      props?.onGeoJsonGeometrySet(args);
    }
    setGeoJson(args);
  };
  return (
    <LeafletMap
      {...props}
      geoJsonGeometry={geoJson}
      onGeoJsonGeometrySet={props?.onGeoJsonGeometrySet ? handleGeoJsonChange : undefined}
      mapContainerChild={<StorybookLeafletMapExposer />}
    />
  );
};

export default {
  title: 'Internal API / Map',
  component: LeafletMap,
  decorators: [withMapLayout],
  render: StorybookLeafletMap,
} satisfies Meta<typeof StorybookLeafletMap>;

type Story = StoryObj<typeof StorybookLeafletMap>;

export const Polygon: Story = {
  args: {
    geoJsonGeometry: {
      type: 'Polygon',
      coordinates: [
        [
          [5.291266, 52.1326332],
          [5.091266, 52.128332],
          [5.591266, 52.48332],
        ],
      ],
    },
  },
};

export const Line: Story = {
  args: {
    geoJsonGeometry: {
      type: 'LineString',
      coordinates: [
        [4.7493255, 52.6405471],
        [4.6493255, 52.4405471],
        [4.5493255, 52.2405471],
      ],
    },
  },
};

export const Point: Story = {
  args: {
    geoJsonGeometry: {
      type: 'Point',
      coordinates: [5.291266, 52.1326332],
    },
  },
};

const getLocationButtonLabel = async (): Promise<string> => {
  const locationPermission = await getLocationPermission();
  return locationPermission === LOCATION_PERMISSIONS.denied
    ? 'Current location cannot be accessed'
    : 'Current location';
};

export const SetPoint: Story = {
  args: {
    onGeoJsonGeometrySet: fn(),
    interactions: {
      marker: true,
      polygon: false,
      polyline: false,
    },
  },
  play: async ({canvasElement, step, args}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    // There is a "Current location" button
    const locationButtonLabel = await getLocationButtonLabel();
    const currentLocationButton = await within(map).findByRole('link', {
      name: locationButtonLabel,
    });
    expect(currentLocationButton).toBeInTheDocument();

    await step('Draw a marker', async () => {
      // @ts-expect-error the x/y coordinates don't seem to be defined in testing-library
      await userEvent.click(map, {x: 100, y: 100});

      // This 'button' is the placed marker on the map
      expect(await canvas.findByRole('button', {name: 'Marker'})).toBeVisible();
      expect(args.onGeoJsonGeometrySet).toBeCalledWith({
        type: 'Point',
        // Expect that the coordinates array contains 2 items.
        // We cannot pin it to specific values, because they can differentiate.
        // To make sure that this test doesn't magically fail, just expect any 2 values
        coordinates: [expect.anything(), expect.anything()],
      });
    });
  },
};

const searchProvider = new MockProvider();

export const SetPointWithAddressLookup: Story = {
  decorators: [withMapLayout, withFormSettingsProvider],
  args: {
    onGeoJsonGeometrySet: fn(),
    interactions: {
      marker: true,
      polygon: false,
      polyline: false,
    },
  },
  parameters: {
    formSettings: {
      componentParameters: {
        map: {
          mapNearestLookup: async () => ({
            label: 'Right here',
          }),
          searchProvider,
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement, step, args}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    // There is a "Current location" button
    const locationButtonLabel = await getLocationButtonLabel();
    const currentLocationButton = await within(map).findByRole('link', {
      name: locationButtonLabel,
    });
    expect(currentLocationButton).toBeInTheDocument();

    await step('Draw a marker', async () => {
      // @ts-expect-error the x/y coordinates don't seem to be defined in testing-library
      await userEvent.click(map, {x: 100, y: 100});

      // This 'button' is the placed marker on the map
      expect(await canvas.findByRole('button', {name: 'Marker'})).toBeVisible();
      expect(args.onGeoJsonGeometrySet).toBeCalledWith({
        type: 'Point',
        // Expect that the coordinates array contains 2 items.
        // We cannot pin it to specific values, because they can differentiate.
        // To make sure that this test doesn't magically fail, just expect any 2 values
        coordinates: [expect.anything(), expect.anything()],
      });

      expect(await canvas.findByText('Right here')).toBeVisible();
    });
  },
};

export const WithoutInteractions: Story = {
  args: {
    interactions: {
      marker: false,
      polygon: false,
      polyline: false,
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    const locationButtonLabel = await getLocationButtonLabel();
    const currentLocationButton = canvas.queryByTitle(locationButtonLabel);
    expect(currentLocationButton).not.toBeInTheDocument();

    const deleteButton = canvas.queryByTitle('Remove shapes');
    expect(deleteButton).not.toBeInTheDocument();
  },
};

export const SingleInteractionMode: Story = {
  args: {
    interactions: {
      marker: true,
      polygon: false,
      polyline: false,
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    // There is a "Current location" button
    const locationButtonLabel = await getLocationButtonLabel();
    const currentLocationButton = await within(map).findByRole('link', {
      name: locationButtonLabel,
    });
    expect(currentLocationButton).toBeInTheDocument();

    const deleteButton = canvas.queryByTitle('No shapes to remove');
    expect(deleteButton).toBeInTheDocument();
  },
};

export const AllInteractions: Story = {
  args: {
    interactions: {
      marker: true,
      polygon: true,
      polyline: true,
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    // There is a "Current location" button
    const locationButtonLabel = await getLocationButtonLabel();
    const currentLocationButton = await within(map).findByRole('link', {
      name: locationButtonLabel,
    });
    expect(currentLocationButton).toBeInTheDocument();

    const markerButton = await within(map).findByRole('link', {name: 'Marker'});
    expect(markerButton).toBeInTheDocument();

    const polygonButton = await within(map).findByRole('link', {name: 'Shape (polygon)'});
    expect(polygonButton).toBeInTheDocument();

    const lineButton = await within(map).findByRole('link', {name: 'Line'});
    expect(lineButton).toBeInTheDocument();
  },
};

export const WithCurrentLocationGranted: Story = {
  args: {
    interactions: {
      marker: true,
      polygon: false,
      polyline: false,
    },
  },
  parameters: {
    geolocation: {
      permission: LOCATION_PERMISSIONS.granted,
      latitude: 52.3857386,
      longitude: 4.8417475,
      updatePermission: () => {}, // Is set by withGeolocationMocking
    },
  },
  decorators: [withMapLayout, withGeolocationMocking],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    const mapSetViewSpy = spyOn(window._OF_INTERNAL_leafletMap, 'setView');

    // There is a "Current location" button
    const currentLocationButton = await within(map).findByRole('link', {name: 'Current location'});
    expect(currentLocationButton).toBeVisible();
    expect(currentLocationButton).not.toHaveAttribute('aria-disabled');

    // When clicking the button, the map setView is called with the latitude and
    // longitude of the geolocation (i.e. the current location of the user).
    await userEvent.click(currentLocationButton);
    expect(mapSetViewSpy).toHaveBeenCalledWith({
      lat: 52.3857386,
      lng: 4.8417475,
    });
  },
};

export const WithCurrentLocationDenied: Story = {
  args: {
    interactions: {
      marker: true,
      polygon: false,
      polyline: false,
    },
  },
  parameters: {
    geolocation: {
      permission: LOCATION_PERMISSIONS.denied,
    },
  },
  decorators: [withMapLayout, withGeolocationMocking],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    const mapSetViewSpy = spyOn(window._OF_INTERNAL_leafletMap, 'setView');

    // There is a "Current location" button
    const currentLocationButton = await within(map).findByRole('link', {
      name: 'Current location cannot be accessed',
    });
    expect(currentLocationButton).toBeVisible();
    expect(currentLocationButton).toHaveAttribute('aria-disabled');

    // When clicking the button, the map setView is called with the latitude and
    // longitude of the geolocation (i.e. the current location of the user).
    await userEvent.click(currentLocationButton);
    expect(mapSetViewSpy).not.toHaveBeenCalledWith({
      lat: 52.3857386,
      lng: 4.8417475,
    });
  },
};

export const WithCurrentLocationManuallyTogglePermission: Story = {
  args: {
    interactions: {
      marker: true,
      polygon: false,
      polyline: false,
    },
  },
  parameters: {
    geolocation: {
      permission: LOCATION_PERMISSIONS.prompt,
    },
  },
  decorators: [withMapLayout, withGeolocationMocking],
  play: async ({canvasElement, step, parameters}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    const mapSetViewSpy = spyOn(window._OF_INTERNAL_leafletMap, 'setView');
    const currentLocationButton = await within(map).findByRole('link', {name: 'Current location'});

    step('Initially enabled location control', () => {
      expect(currentLocationButton).toBeVisible();
      expect(currentLocationButton).not.toHaveAttribute('aria-disabled');
    });

    // Simulate geolocation permission change. We cannot target the permission window,
    // so we simulate the permission change via a mock helper function.
    parameters.geolocation.updatePermission('denied');

    await step('After denial of geolocation permission', async () => {
      // The "current location" button is now in a "disabled" state
      expect(currentLocationButton).toBeVisible();
      expect(currentLocationButton).toHaveAttribute(
        'aria-label',
        'Current location cannot be accessed'
      );
      expect(currentLocationButton).toHaveAttribute('aria-disabled', 'true');

      // When clicking the location button, nothing happens
      await userEvent.click(currentLocationButton);
      expect(mapSetViewSpy).not.toHaveBeenCalled();
    });

    // Toggling back to enabled
    parameters.geolocation.updatePermission('granted');

    step('After granting permission for geolocation', async () => {
      // The "current location" button is now again in an "enabled" state
      expect(currentLocationButton).toBeVisible();
      expect(currentLocationButton).toHaveAttribute('aria-label', 'Current location');
      expect(currentLocationButton).not.toHaveAttribute('aria-disabled');

      // When clicking the location button, nothing happens
      await userEvent.click(currentLocationButton);
      expect(mapSetViewSpy).toHaveBeenCalledOnce();
    });
  },
};
