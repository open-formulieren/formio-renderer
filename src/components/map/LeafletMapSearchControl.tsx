import type {Control, LeafletEvent, Marker} from 'leaflet';
import {GeoSearchControl} from 'leaflet-geosearch';
import type {Provider} from 'leaflet-geosearch/dist/providers/index.js';
import {useEffect} from 'react';
import {useIntl} from 'react-intl';
import {useMap} from 'react-leaflet';

import {useFormSettings} from '@/hooks';

import './LeafletMapSearchControl.scss';
import {searchControlMessages} from './translations';

type SearchControlOptions = {
  showMarker: boolean;
  showPopup: boolean;
  retainZoomLevel: boolean;
  animateZoom: boolean;
  autoClose: boolean;
  searchLabel: string;
  keepResult: boolean;
  updateMap: boolean;
  notFoundMessage: string;
};

export type GeoSearchShowLocationEvent = LeafletEvent & {
  location: {
    label: string;
    x: number;
    y: number;
  };
  marker: Marker;
};

interface SearchControlProps {
  onMarkerSet: (event: GeoSearchShowLocationEvent) => void;
  options: SearchControlOptions;
}

interface GeoSearchControlConstructor {
  new (value?: SearchControlOptions & {provider: Provider; style: string}): Control;
  (): Control;
  (value: SearchControlOptions & {provider: Provider; style: string}): Control;
}

const SearchControl: React.FC<SearchControlProps> = ({onMarkerSet, options}) => {
  const map = useMap();
  const intl = useIntl();
  const formSettings = useFormSettings();
  const searchProvider = formSettings?.componentParameters?.map?.searchProvider;

  const {
    showMarker,
    showPopup,
    retainZoomLevel,
    animateZoom,
    autoClose,
    searchLabel,
    keepResult,
    updateMap,
    notFoundMessage,
  } = options;

  const buttonLabel = intl.formatMessage(searchControlMessages.buttonLabel);

  useEffect(() => {
    if (!searchProvider) return () => null;

    // Leaflet-geosearch isn't very typescript friendly...
    const searchControl = new (GeoSearchControl as unknown as GeoSearchControlConstructor)({
      provider: searchProvider,
      style: 'button',
      showMarker,
      showPopup,
      retainZoomLevel,
      animateZoom,
      autoClose,
      searchLabel,
      keepResult,
      updateMap,
      notFoundMessage,
    });

    if ('button' in searchControl) {
      (searchControl.button as HTMLButtonElement).setAttribute('aria-label', buttonLabel);
    }
    map.addControl(searchControl);
    map.on('geosearch/showlocation', onMarkerSet);

    return () => {
      map.off('geosearch/showlocation', onMarkerSet);
      map.removeControl(searchControl);
    };
  }, [
    map,
    onMarkerSet,
    searchProvider,
    showMarker,
    showPopup,
    retainZoomLevel,
    animateZoom,
    autoClose,
    searchLabel,
    keepResult,
    updateMap,
    notFoundMessage,
    buttonLabel,
  ]);

  return null;
};

export default SearchControl;
