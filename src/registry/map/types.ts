export interface NearestLookupBody {
  label: string;
}

// export interface SearchBody {}

export interface MapParameters {
  mapNearestLookup: (lat: string, lng: string) => Promise<NearestLookupBody> | null;
  // TODO: should this be done through a callback?
  // see https://github.com/open-formulieren/open-forms-sdk/blob/a8246baa4b39637c144e328d5f2d6312349da312/src/components/Map/LeafletMapSearchControl.tsx#L45
  // and https://github.com/open-formulieren/open-forms-sdk/blob/a8246baa4b39637c144e328d5f2d6312349da312/src/components/Map/provider.ts#L24
  // mapSearch: (
  //   lat: string,
  //   lng: string
  // ) => Promise<SearchBody> | null,
}
