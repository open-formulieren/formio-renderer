import type {GeoJsonGeometry, MapComponentSchema} from '@open-formulieren/types';
import {FormField} from '@utrecht/component-library-react';
import {useField} from 'formik';
import React from 'react';

import {HelpText, Label} from '@/components/forms';
import Tooltip from '@/components/forms/Tooltip';
import LeafletMap from '@/components/map';
import {useFieldConfig} from '@/hooks';

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

  const name = useFieldConfig(key);
  const [{value}, , {setValue}] = useField<null | GeoJsonGeometry>(name);
  const withoutControl = !interactions || Object.values(interactions).every(value => !value);

  return (
    <FormField className="utrecht-form-field--openforms">
      <Label
        isDisabled={withoutControl}
        tooltip={tooltip ? <Tooltip>{tooltip}</Tooltip> : undefined}
      >
        {label}
      </Label>
      <React.Suspense>
        <LeafletMap
          geoJsonGeometry={value}
          defaultZoomLevel={defaultZoom ?? undefined}
          tileLayerUrl={tileLayerUrl}
          defaultCenter={
            initialCenter && initialCenter.lng && initialCenter.lat
              ? [initialCenter.lat, initialCenter.lng]
              : undefined
          }
          interactions={interactions}
          overlays={overlays}
          onGeoJsonGeometrySet={setValue}
        />
      </React.Suspense>

      <HelpText>{description}</HelpText>
    </FormField>
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
