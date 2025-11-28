import type {GeoJsonGeometry, MapComponentSchema} from '@open-formulieren/types';
import {FormField} from '@utrecht/component-library-react';
import {useField, useFormikContext} from 'formik';
import React, {useId} from 'react';

import {HelpText, Label, ValidationErrors} from '@/components/forms';
import Tooltip from '@/components/forms/Tooltip';
import LeafletMap from '@/components/map';
import {useFieldConfig, useFieldError} from '@/hooks';

import type {RegistryEntry} from '../types';
import ValueDisplay from './ValueDisplay';
import {DEFAULT_INTERACTIONS} from './constants';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioMapProps {
  componentDefinition: MapComponentSchema;
}

export const FormioMap: React.FC<FormioMapProps> = ({componentDefinition}) => {
  const {
    key,
    label,
    tooltip,
    description,
    defaultZoom,
    initialCenter,
    tileLayerUrl,
    interactions = DEFAULT_INTERACTIONS,
    overlays,
  } = componentDefinition;
  const name = useFieldConfig(key);
  const id = useId();
  const {validateField} = useFormikContext();
  const [{value}, {touched}, {setTouched, setValue}] = useField<null | GeoJsonGeometry>(name);
  const withoutControl = Object.values(interactions).every(value => !value);
  const error = useFieldError(name, false);

  const errorMessageId = error ? `${id}-error-message` : undefined;

  return (
    <FormField invalid={error ? true : false} className="utrecht-form-field--openforms">
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
          onGeoJsonGeometrySet={(geoJsonGeometry: GeoJsonGeometry) => {
            setTouched(true, false);
            setValue(geoJsonGeometry, true);
          }}
          onBlur={() => {
            // unsure why the microtask approach works here, but without the
            // `DeleteButton` story follows the `#` anchor of the delete button (link)
            // in storybook. This doesn't seem to happen in production builds.
            // Using a useCallback approach doesn't seem to make a difference. One
            // suspicion was also that the `window.confirm` messed up things, but so
            // far only the microtask approach seems to work :shrug:
            window.queueMicrotask(async () => {
              setTouched(true);
              validateField(name);
            });
          }}
        />
      </React.Suspense>

      <HelpText>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
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
