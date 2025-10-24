import {RequestResult} from 'leaflet-geosearch/dist/providers/amapProvider.js';
import AbstractProvider, {
  EndpointArgument,
  ParseArgument,
  ProviderOptions,
  SearchResult,
} from 'leaflet-geosearch/dist/providers/provider.js';

interface MockSearchResult {
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

declare type MockProviderOptions = {
  mockResults: MockSearchResult[];
} & ProviderOptions;

// TODO: use this in the storybook tests to test search functionality
export default class MockProvider extends AbstractProvider<MockSearchResult[], MockSearchResult> {
  mockResults: MockSearchResult[];

  constructor(options?: MockProviderOptions) {
    super(options);

    const {mockResults} = options;
    this.mockResults = mockResults;
  }

  endpoint = ({query}: EndpointArgument): string => {
    const params = typeof query === 'string' ? {q: query} : query;
    return this.getUrl('example.com', params);
  };

  parse = (response: ParseArgument<RequestResult>): SearchResult<MockSearchResult>[] => {
    return response.map(location => ({
      label: location.label,
      x: location.latLng.lng,
      y: location.latLng.lat,
    }));
  };

  async search(): Promise<SearchResult[]> {
    return this.parse({data: this.mockResults});
  }
}
