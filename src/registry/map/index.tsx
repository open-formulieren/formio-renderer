import type {MapComponentSchema} from '@open-formulieren/types';
import React from 'react';

import MapField from '@/components/map';

import type {RegistryEntry} from '../types';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioMapProps {
  componentDefinition: MapComponentSchema;
}

const ValueDisplay = React.lazy(() => import('./ValueDisplay'));

export const FormioMap: React.FC<FormioMapProps> = ({componentDefinition}) => {
  const {
    key,
    label,
    tooltip,
    description,
    defaultZoom,
    initialCenter,
    tileLayerUrl,
    interactions,
    overlays,
  } = componentDefinition;

  return (
    <React.Suspense>
      <MapField
        name={key}
        label={label}
        tooltip={tooltip}
        description={description}
        defaultZoomLevel={defaultZoom ?? undefined}
        tileLayerUrl={tileLayerUrl}
        defaultCenter={
          initialCenter && initialCenter.lng && initialCenter.lat
            ? [initialCenter.lat, initialCenter.lng]
            : undefined
        }
        interactions={interactions}
        overlays={overlays}
      />
    </React.Suspense>
  );
};

const MapComponent: RegistryEntry<MapComponentSchema> = {
  formField: FormioMap,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default MapComponent;
