import type {Decorator, Meta, StoryObj} from '@storybook/react-vite';
import {useField} from 'formik';
import type {Map as LMap} from 'leaflet';
import {useEffect} from 'react';
import {useMap} from 'react-leaflet';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';

import type {FormSettings} from '@/context';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import MapField, {MapFieldProps} from './MapField';
import MockProvider from './test';
import {GeoJsonGeometry} from './types';

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
