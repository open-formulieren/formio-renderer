import type {Decorator, Meta, StoryObj} from '@storybook/react-vite';
import {useField} from 'formik';
import type {Map as LMap} from 'leaflet';
import {useEffect} from 'react';
import {useMap} from 'react-leaflet';
import {expect, fn, spyOn, userEvent, waitFor, within} from 'storybook/test';

import type {FormSettings} from '@/context';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import MapField, {type MapFieldProps} from './MapField';
import MockProvider from './test';
import {type GeoJsonGeometry} from './types';

// add our leaflet instrumentation to the global window object
declare global {
  interface Window {
    __leafletMap: LMap;
  }
}

const withMapLayout: Decorator = Story => (
  <div className="openforms-leaflet-map" style={{width: '600px'}}>
    <Story />
  </div>
);

const StorybookLeafletMap = (props: MapFieldProps) => {
  const [, , {setValue}] = useField<GeoJsonGeometry>(props.name);
  const handleGeoJsonChange = (args: GeoJsonGeometry) => {
    if (props?.onGeoJsonGeometrySet) {
      props?.onGeoJsonGeometrySet(args);
    }
    setValue(args);
  };
  return (
    <MapField
      {...props}
      onGeoJsonGeometrySet={handleGeoJsonChange}
      mapContainerChild={<StorybookLeafletMapExposer />}
    />
  );
};

const StorybookLeafletMapExposer = () => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      window.__leafletMap = map;
    }
  }, [map]);
  return null;
};

const searchProvider = new MockProvider();

export default {
  title: 'Internal API / Map',
  component: MapField,
  decorators: [withMapLayout, withFormSettingsProvider, withFormik],
  render: StorybookLeafletMap,
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
} satisfies Meta<typeof StorybookLeafletMap>;

type Story = StoryObj<typeof StorybookLeafletMap>;

export const Point: Story = {
  args: {
    name: 'map',
    label: 'Map',
    description: 'Click the map to set a point',
    interactions: {
      marker: true,
      polygon: false,
      polyline: false,
    },
    onGeoJsonGeometrySet: fn(),
  },
  parameters: {
    formik: {
      initialValues: {
        map: {
          type: 'Point',
          coordinates: [5.291266, 52.1326332],
        },
      },
    },
  },
  play: async ({canvasElement, step, args}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    await step('None of the interactions are shown', async () => {
      const pin = canvas.queryByTitle('Marker');
      const polygon = canvas.queryByTitle('Shape (polygon)');
      const line = canvas.queryByTitle('Line');

      expect(pin).not.toBeInTheDocument();
      expect(polygon).not.toBeInTheDocument();
      expect(line).not.toBeInTheDocument();
    });

    await step('Draw a marker', async () => {
      // Because there is only one shape, we can draw without having to click the
      // "draw marker" button.
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

export const Polygon: Story = {
  args: {
    name: 'map',
    label: 'Map',
    interactions: {
      marker: false,
      polygon: true,
      polyline: false,
    },
    onGeoJsonGeometrySet: fn(),
  },
  parameters: {
    formik: {
      initialValues: {
        map: {
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
    },
  },
};

export const LineString: Story = {
  args: {
    name: 'map',
    label: 'Map',
    interactions: {
      marker: true,
      polygon: false,
      polyline: true,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        map: {
          type: 'LineString',
          coordinates: [
            [4.7493255, 52.6405471],
            [4.6493255, 52.4405471],
            [4.5493255, 52.2405471],
          ],
        },
      },
    },
  },
};

export const MultipleInteractions: Story = {
  args: {
    name: 'map',
    label: 'Multiple map',
    description: 'Multiple interactions',
    interactions: {
      marker: true,
      polygon: true,
      polyline: true,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        map: {
          type: 'LineString',
          coordinates: [
            [4.7493255, 52.6405471],
            [4.6493255, 52.4405471],
            [4.5493255, 52.2405471],
          ],
        },
      },
    },
  },
};

export const DisabledMap: Story = {
  args: {
    name: 'map',
    label: 'Disabled map',
    description: 'No should not be able to edit me',
    isDisabled: true,
  },
  parameters: {
    formik: {
      initialValues: {
        map: {
          type: 'Point',
          coordinates: [5.291266, 52.1326332],
        },
      },
    },
  },
};

export const DeleteButton: Story = {
  args: {
    name: 'map',
    label: 'Delete button',
    description: 'Click the delete button to remove the current shape',
    interactions: {
      marker: true,
      polygon: false,
      polyline: false,
    },
    onGeoJsonGeometrySet: fn(),
  },
  parameters: {
    formik: {
      initialValues: {
        map: {
          type: 'Point',
          coordinates: [5.291266, 52.1326332],
        },
      },
    },
  },
  play: async ({canvasElement, step, args}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    // Sanity check, the `args.geoJsonGeometry` is shown in the map component.
    expect(await within(map).findByRole('button', {name: 'Marker'})).toBeVisible();

    // The delete button is shown in the map, and is enabled.
    const deleteButton = await within(map).findByRole('link', {name: 'Remove shapes'});
    expect(deleteButton).toBeVisible();
    expect(deleteButton).toBeEnabled();

    await step('delete marker', async () => {
      // Automatically resolve the confirmation message
      window.confirm = () => true;
      await userEvent.click(deleteButton);

      // The value "null" is used to clear the map user data.
      expect(args.onGeoJsonGeometrySet).toHaveBeenCalledWith(null);
    });

    await step('Check that no marker is visible and delete button is disabled', async () => {
      // Expect marker to no-longer be visible.
      await waitFor(async () => {
        const marker = await within(map).queryByRole('button', {name: 'Marker'});
        expect(marker).toBeNull();
      });

      expect(deleteButton).toHaveAttribute('title', 'No shapes to remove');
      expect(deleteButton).toHaveClass('leaflet-disabled');
    });
  },
};

export const SearchInput: Story = {
  args: {
    name: 'map',
    label: 'Map',
    description: 'Use the search input to search for a location',
    interactions: {
      marker: false,
      polygon: false,
      polyline: false,
    },
    onGeoJsonGeometrySet: fn(),
  },
  play: async ({canvasElement, step, args}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');
    searchProvider.mockResults = [
      {
        label: 'Utrecht, Utrecht, Utrecht',
        latLng: {
          lat: 52.0886922,
          lng: 5.09520363,
        },
        rd: {
          x: 134987.52,
          y: 455643.648,
        },
      },
    ];

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    await step('None of the interactions are shown', async () => {
      const pin = canvas.queryByTitle('Marker');
      const polygon = canvas.queryByTitle('Shape (polygon)');
      const line = canvas.queryByTitle('Line');

      expect(pin).not.toBeInTheDocument();
      expect(polygon).not.toBeInTheDocument();
      expect(line).not.toBeInTheDocument();
    });

    await step('Use the search input', async () => {
      await waitFor(async () => {
        const button = await canvas.findByLabelText('Map component search button');
        await userEvent.click(button);
        expect(await canvas.findByPlaceholderText('Enter address, please')).toBeVisible();
      });

      const searchField = await canvas.findByPlaceholderText('Enter address, please');
      const searchBox = within(searchField.parentElement!);
      await userEvent.type(searchField, 'Gemeente Utrecht');
      const searchResult = await searchBox.findByText('Utrecht, Utrecht, Utrecht');

      await userEvent.click(searchResult);

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

export const WithAerialPhotoBackground: Story = {
  args: {
    name: 'map',
    label: 'Map',
    interactions: {
      marker: false,
      polygon: true,
      polyline: false,
    },
    onGeoJsonGeometrySet: fn(),
    tileLayerUrl:
      'https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_orthoHR/EPSG:28992/{z}/{x}/{y}.png',
  },
};

export const WithOverlays: Story = {
  args: {
    name: 'map',
    label: 'Map',
    interactions: {
      marker: false,
      polygon: true,
      polyline: false,
    },
    onGeoJsonGeometrySet: fn(),
    overlays: [
      {
        uuid: 'f20448c3-a8cb-471c-bfcc-78a6c22d0ae6',
        url: 'https://service.pdok.nl/bzk/bro-grondwaterspiegeldiepte/wms/v2_0?request=getCapabilities&service=WMS',
        label: 'Grondwaterspiegeldiepte layer',
        type: 'wms',
        layers: ['bro-grondwaterspiegeldieptemetingen-GHG'],
      },
      {
        uuid: '931f18f0-cedc-453b-a2d5-a2c1ff9df523',
        url: 'https://service.pdok.nl/lv/bag/wms/v2_0?request=getCapabilities&service=WMS',
        label: 'BAG Pand and Verblijfsobject layer',
        type: 'wms',
        layers: ['pand', 'verblijfsobject'],
      },
      {
        uuid: '4a76c09a-2ae3-4c17-8b40-ade45cb86a0e',
        url: 'https://service.pdok.nl/lv/bag/wfs/v2_0?request=getCapabilities&service=WFS',
        label: 'Unsupported WFS layer',
        type: 'wfs',
        layers: ['pand'],
      },
    ],
  },
};

export const WithCurrentLocationGranted: Story = {
  args: {
    name: 'map',
    label: 'Current location map',
    description: 'Map with current location permission granted',
  },
  parameters: {},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    const mapSetViewSpy = spyOn(window.__leafletMap, 'setView');

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
    name: 'map',
    label: 'Current location map',
    description: 'Map with current location permission denied',
  },
  parameters: {
    geolocation: {
      permission: 'denied',
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    const mapSetViewSpy = spyOn(window.__leafletMap, 'setView');

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
    name: 'map',
    label: 'Current location map',
    description: 'Map with current location permission toggled',
  },
  parameters: {
    geolocation: {
      permission: 'prompt',
    },
  },
  play: async ({canvasElement, step, parameters}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    const mapSetViewSpy = spyOn(window.__leafletMap, 'setView');
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
