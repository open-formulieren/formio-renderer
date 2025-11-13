import AbstractProvider, {
  type ParseArgument,
  type ProviderOptions,
  type SearchResult,
} from 'leaflet-geosearch/src/providers/provider.js';

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
