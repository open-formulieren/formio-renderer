import type {Provider} from 'leaflet-geosearch/dist/providers/index.js';

export interface NearestLookupBody {
  label: string;
}

export interface MapParameters {
  mapNearestLookup: (lat: number, lng: number) => Promise<NearestLookupBody | null>;
  searchProvider: Provider;
}
