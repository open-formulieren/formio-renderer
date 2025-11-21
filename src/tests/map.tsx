import type {Decorator} from '@storybook/react-vite';
import AbstractProvider from 'leaflet-geosearch/src/providers/provider.js';
import type {
  ParseArgument,
  ProviderOptions,
  SearchResult,
} from 'leaflet-geosearch/src/providers/provider.js';

export const withMapLayout: Decorator = Story => (
  <div className="openforms-leaflet-map" style={{width: '600px'}}>
    <Story />
  </div>
);

interface MockSearchResult {
  label: string;
  x: number;
  y: number;
}

interface MockRequestSearchResult {
  label: string;
  // The address coordinates in WGS 84 coordinate system
  latLng: {
    lat: number;
    lng: number;
  };
  // The address coordinates in Rijksdriehoek coordinate system
  rd: {
    x: number;
    y: number;
  };
}

export default class MockProvider extends AbstractProvider {
  mockResults: MockRequestSearchResult[];

  constructor(options?: ProviderOptions) {
    super(options);
    this.mockResults = [];
  }

  endpoint(): string {
    return 'https://example.com';
  }

  parse(response: ParseArgument<MockRequestSearchResult[]>): SearchResult<MockSearchResult>[] {
    return response.data.map(location => ({
      label: location.label,
      x: location.latLng.lng,
      y: location.latLng.lat,
      raw: {label: location.label, x: location.latLng.lng, y: location.latLng.lat},
      bounds: null,
    }));
  }

  async search(): Promise<SearchResult<MockSearchResult>[]> {
    return this.parse({data: this.mockResults});
  }
}

type GeolocationMockParams = {
  geolocationPermission?: PermissionState;
  geolocationLatitude?: number;
  geolocationLongitude?: number;
};

export const setupGeolocationMock = ({
  geolocationPermission = 'granted',
  geolocationLatitude = 52.3857386,
  geolocationLongitude = 4.8417475,
}: GeolocationMockParams) => {
  const originalPermissionsQuery = navigator.permissions?.query;
  let permissionState = geolocationPermission;

  // Fake PermissionStatus object
  const permissionStatus: PermissionStatus = {
    // `PermissionStatus` uses the event listener hooking of `EventTarget`,
    // so we have to add them.
    ...new EventTarget(),
    state: permissionState,
    name: '',
    // The onchange should be overwritten by the code implementing the
    // navigator.permissions.query
    onchange: () => {},
  };

  const updateGeolocationPermission = (newPermission: PermissionState) => {
    if (permissionState !== newPermission) {
      permissionState = newPermission;

      // Set new permission and trigger an onchange event
      Object.defineProperty(permissionStatus, 'state', {value: newPermission});
      permissionStatus.onchange?.(new Event('change'));
    }
  };

  // Mock Permissions API
  if (navigator.permissions?.query) {
    navigator.permissions.query = params => {
      if (params.name === 'geolocation') {
        return Promise.resolve(permissionStatus);
      }
      return originalPermissionsQuery(params);
    };
  }

  // Mock Geolocation
  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: (success: PositionCallback, error: PositionErrorCallback) => {
        switch (permissionState) {
          case 'granted':
            success({
              coords: {
                latitude: geolocationLatitude,
                longitude: geolocationLongitude,
              },
            } as GeolocationPosition);
            return;

          case 'prompt':
            // simulate no decision yet → error or no-op
            error?.({
              code: 1,
              message: 'Permission prompt (simulated)',
            } as GeolocationPositionError);
            return;

          case 'denied':
            error?.({
              code: 1, // PERMISSION_DENIED
              message: 'User denied Geolocation',
            } as GeolocationPositionError);
        }
      },
    },
    configurable: true,
  });

  return {updateGeolocationPermission};
};

export const withGeolocationMocking: Decorator = (Story, {parameters}) => {
  const {updateGeolocationPermission} = setupGeolocationMock({
    geolocationPermission: parameters.geolocation.permission,
    geolocationLatitude: parameters.geolocation.latitude,
    geolocationLongitude: parameters.geolocation.longitude,
  });

  // Expose updateGeolocationPermission function
  parameters.geolocation.updatePermission = updateGeolocationPermission;

  return <Story />;
};
