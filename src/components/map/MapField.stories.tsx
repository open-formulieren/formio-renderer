import type {Meta, StoryObj} from '@storybook/react-vite';
import type {Map as LMap} from 'leaflet';
import {useEffect} from 'react';
import {useMap} from 'react-leaflet';
import {expect, spyOn, userEvent, waitFor, within} from 'storybook/test';

import {withFormik} from '@/sb-decorators';
import {withGeolocationMocking, withMapLayout} from '@/tests/map';

import MapField from './MapField';
import type {MapFieldProps} from './MapField';

// add our leaflet instrumentation to the global window object
declare global {
  interface Window {
    __leafletMap: LMap;
  }
}

const StorybookLeafletMapExposer = () => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      window.__leafletMap = map;
    }
  }, [map]);
  return null;
};

const StorybookLeafletMap = (props: MapFieldProps) => (
  <MapField {...props} mapContainerChild={<StorybookLeafletMapExposer />} />
);

export default {
  title: 'Internal API / Map',
  component: MapField,
  decorators: [withMapLayout, withFormik, withGeolocationMocking],
  render: StorybookLeafletMap,
} satisfies Meta<typeof StorybookLeafletMap>;

type Story = StoryObj<typeof StorybookLeafletMap>;

export const WithCurrentLocationGranted: Story = {
  parameters: {
    geolocation: {
      permission: 'granted',
      latitude: 52.3857386,
      longitude: 4.8417475,
      updatePermission: () => {}, // Is set by withGeolocationMocking
    },
  },
  args: {
    name: 'map',
    label: 'Current location map',
    description: 'Map with current location permission granted',
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
