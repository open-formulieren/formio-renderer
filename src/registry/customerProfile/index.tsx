import type {CustomerProfileComponentSchema} from '@open-formulieren/types';
import {useId} from 'react';

import FormFieldContainer from '@/components/FormFieldContainer';
import LoadingIndicator from '@/components/LoadingIndicator';
import Fieldset from '@/components/forms/Fieldset';
import HelpText from '@/components/forms/HelpText';
import Tooltip from '@/components/forms/Tooltip';
import {useFieldConfig} from '@/hooks';
import type {RegistryEntry} from '@/registry/types';

import './CustomerProfile.scss';
import isEmpty from './empty';
import {useDigitalAddresses} from './hooks';
import {DigitalAddressFields} from './subFields';
import getValidationSchema from './validationSchema';

export interface FormioCustomerProfileProps {
  componentDefinition: CustomerProfileComponentSchema;
}

export const FormioCustomerProfile: React.FC<FormioCustomerProfileProps> = ({
  componentDefinition: {key: name, label, tooltip, description, validate, digitalAddressTypes},
}) => {
  const id = useId();
  name = useFieldConfig(name);
  const {digitalAddresses, loading} = useDigitalAddresses(name, digitalAddressTypes);

  const isRequired = validate?.required;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <Fieldset
      header={
        <>
          {label}
          {tooltip && <Tooltip>{tooltip}</Tooltip>}
        </>
      }
      hasTooltip={!!tooltip}
      aria-describedby={descriptionId || undefined}
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
                isRequired={isRequired}
                digitalAddressGroup={digitalAddress}
              />
            );
          })}
        </FormFieldContainer>
      )}
      <HelpText id={descriptionId}>{description}</HelpText>
    </Fieldset>
  );
};

const CustomerProfileComponent: RegistryEntry<CustomerProfileComponentSchema> = {
  formField: FormioCustomerProfile,
  getValidationSchema,
  isEmpty,
};

export default CustomerProfileComponent;
