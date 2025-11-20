import type {CustomerProfileComponentSchema, DigitalAddress} from '@open-formulieren/types';
import type {FormikErrors} from 'formik';
import {useFormikContext} from 'formik';
import {useId} from 'react';

import {ValidationErrors} from '@/components/forms';
import Fieldset from '@/components/forms/Fieldset';
import HelpText from '@/components/forms/HelpText';
import Tooltip from '@/components/forms/Tooltip';
import {useFieldConfig} from '@/hooks';
import type {RegistryEntry} from '@/registry/types';

import './CustomerProfile.scss';
import {useDigitalAddresses} from './digitalAddresses';
import isEmpty from './empty';
import {DigitalAddressFields} from './subFields';
import getValidationSchema from './validationSchema';

export interface FormioCustomerProfileProps {
  componentDefinition: CustomerProfileComponentSchema;
}

export const FormioCustomerProfile: React.FC<FormioCustomerProfileProps> = ({
  componentDefinition: {key: name, label, tooltip, description, validate, digitalAddressTypes},
}) => {
  const {getFieldMeta} = useFormikContext();
  const id = useId();
  name = useFieldConfig(name);
  const {touched, error: formikError} = getFieldMeta(name);
  const {digitalAddresses} = useDigitalAddresses(name, digitalAddressTypes);

  const error = formikError as unknown as
    | undefined
    | string
    | (string | FormikErrors<DigitalAddress>)[];

  const fieldError = typeof error === 'string' && error;

  const invalid = touched && !!fieldError;
  const isRequired = validate?.required;
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
      className="openforms-customer-profile"
    >
      <div className="openforms-customer-profile__form-field-container">
        {digitalAddressTypes.map((digitalAddressType, index) => {
          const Component = DigitalAddressFields[digitalAddressType];
          const digitalAddress = digitalAddresses[digitalAddressType];

          return (
            <Component
              key={digitalAddressType}
              namePrefix={`${name}.${index}`}
              isRequired={isRequired}
              digitalAddressGroup={digitalAddress}
            />
          );
        })}
      </div>
      <HelpText id={descriptionId}>{description}</HelpText>
      {fieldError && errorMessageId && <ValidationErrors id={errorMessageId} error={fieldError} />}
    </Fieldset>
  );
};

const CustomerProfileComponent: RegistryEntry<CustomerProfileComponentSchema> = {
  formField: FormioCustomerProfile,
  getValidationSchema,
  isEmpty,
};

export default CustomerProfileComponent;
