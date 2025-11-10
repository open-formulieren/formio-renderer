import type {CustomerProfileComponentSchema} from '@open-formulieren/types';
import {useId} from 'react';

import Fieldset from '@/components/forms/Fieldset';
import HelpText from '@/components/forms/HelpText';
import Tooltip from '@/components/forms/Tooltip';
import type {RegistryEntry} from '@/registry/types';

import './CustomerProfile.scss';
import {useDigitalAddresses} from './digitalAddresses';
import isEmpty from './empty';
import {EmailField, PhoneNumberField} from './subFields';
import getValidationSchema from './validationSchema';

export interface FormioCustomerProfileProps {
  componentDefinition: CustomerProfileComponentSchema;
}

export const FormioCustomerProfile: React.FC<FormioCustomerProfileProps> = ({
  componentDefinition: {key, label, tooltip, description, validate, digitalAddressTypes},
}) => {
  const id = useId();
  const {digitalAddresses} = useDigitalAddresses(key, digitalAddressTypes);

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
      className="openforms-customer-profile"
    >
      <div className="openforms-customer-profile__form-field-container">
        {digitalAddressTypes.email && (
          <EmailField
            namePrefix={key}
            isRequired={isRequired}
            addresses={digitalAddresses?.emails}
            preferredAddress={digitalAddresses?.preferredEmail}
          />
        )}
        {digitalAddressTypes.phoneNumber && (
          <PhoneNumberField
            namePrefix={key}
            isRequired={isRequired}
            addresses={digitalAddresses?.phoneNumbers}
            preferredAddress={digitalAddresses?.preferredPhoneNumber}
          />
        )}
      </div>
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
