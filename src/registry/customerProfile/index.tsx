import type {CustomerProfileComponentSchema} from '@open-formulieren/types';
import type {DigitalAddress} from '@open-formulieren/types/dist/components/customerProfile';
import type {FormikErrors} from 'formik';
import {getIn, useFormikContext} from 'formik';
import {useId} from 'react';

import FormFieldContainer from '@/components/FormFieldContainer';
import LoadingIndicator from '@/components/LoadingIndicator';
import {ValidationErrors} from '@/components/forms';
import Fieldset from '@/components/forms/Fieldset';
import HelpText from '@/components/forms/HelpText';
import Tooltip from '@/components/forms/Tooltip';
import {useFieldConfig} from '@/hooks';
import type {RegistryEntry} from '@/registry/types';

import './CustomerProfile.scss';
import ValueDisplay from './ValueDisplay';
import {DIGITAL_ADDRESS_FIELD_NAMES} from './constants';
import isEmpty from './empty';
import {useDigitalAddresses} from './hooks';
import getInitialValues from './initialValues';
import {DigitalAddressFields} from './subFields';
import type {CustomerProfileData, FormValues} from './types';
import getValidationSchema from './validationSchema';

export interface FormioCustomerProfileProps {
  componentDefinition: CustomerProfileComponentSchema;
}

export const FormioCustomerProfile: React.FC<FormioCustomerProfileProps> = ({
  componentDefinition: {key: name, label, tooltip, description, validate, digitalAddressTypes},
}) => {
  const {getFieldMeta} = useFormikContext<FormValues>();
  const id = useId();
  name = useFieldConfig(name);
  const {value, error: formikError} = getFieldMeta<CustomerProfileData>(name);
  const {digitalAddresses, loading} = useDigitalAddresses(name, digitalAddressTypes);

  const touched = value?.some((_, index) =>
    DIGITAL_ADDRESS_FIELD_NAMES.some(subFieldName => {
      const nestedFieldName = `${name}.${index}.${subFieldName}`;
      const {touched} = getFieldMeta<boolean>(nestedFieldName);
      return touched;
    })
  );

  const error = formikError as unknown as
    | undefined
    | string
    | (string | FormikErrors<DigitalAddress>)[];

  const fieldError = typeof error === 'string' && error;
  const subfieldErrors = Array.isArray(error);

  const invalid = touched && !!fieldError;
  const isRequired = validate?.required;
  const isSubfieldRequired = isRequired && digitalAddressTypes.length === 1;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;

  return (
    <Fieldset
      header={
        <>
          {label}
          {tooltip && <Tooltip>{tooltip}</Tooltip>}
        </>
      }
      isInvalid={invalid}
      hasTooltip={!!tooltip}
      aria-describedby={[descriptionId, errorMessageId].filter(Boolean).join(' ')}
    >
      {loading ? (
        <LoadingIndicator />
      ) : (
        <FormFieldContainer>
          {digitalAddressTypes.map((digitalAddressType, index) => {
            const Component = DigitalAddressFields[digitalAddressType];
            const digitalAddress = digitalAddresses?.find(
              address => address.type === digitalAddressType
            );

            return (
              <Component
                key={digitalAddressType}
                namePrefix={`${name}.${index}`}
                isRequired={isSubfieldRequired}
                digitalAddressGroup={digitalAddress}
                errors={subfieldErrors ? getIn(error, `${index}`) : undefined}
              />
            );
          })}
        </FormFieldContainer>
      )}
      <HelpText id={descriptionId}>{description}</HelpText>
      {fieldError && errorMessageId && <ValidationErrors id={errorMessageId} error={fieldError} />}
    </Fieldset>
  );
};

const CustomerProfileComponent: RegistryEntry<CustomerProfileComponentSchema> = {
  formField: FormioCustomerProfile,
  getValidationSchema,
  isEmpty,
  valueDisplay: ValueDisplay,
  getInitialValues,
};

export default CustomerProfileComponent;
