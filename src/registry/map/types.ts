import {Provider} from 'leaflet-geosearch/dist/providers/index.js';

export interface NearestLookupBody {
  label: string;
}

export interface MapParameters {
  mapNearestLookup: (lat: string, lng: string) => Promise<NearestLookupBody> | null;
  searchProvider: Provider;
}
