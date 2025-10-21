import type {Decorator, Meta, StoryObj} from '@storybook/react-vite';
import {useField} from 'formik';
import type {Map as LMap} from 'leaflet';
import {useEffect} from 'react';
import {useMap} from 'react-leaflet';

import type {FormSettings} from '@/context';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import MapField, {MapFieldProps} from './MapField';
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

export default {
  title: 'Internal API / Forms / Map',
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
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
} satisfies Meta<typeof StorybookLeafletMap>;

type Story = StoryObj<typeof StorybookLeafletMap>;

export const MinimalConfiguration: Story = {
  args: {
    name: 'map',
    label: 'Map',
    description: 'Click the map to select a location',
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
