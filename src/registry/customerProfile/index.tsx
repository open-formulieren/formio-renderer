import type {CustomerProfileComponentSchema} from '@open-formulieren/types';
import {useId} from 'react';

import Fieldset from '@/components/forms/Fieldset';
import HelpText from '@/components/forms/HelpText';
import Tooltip from '@/components/forms/Tooltip';
import {useDigitalAddresses} from '@/registry/customerProfile/digitalAddresses';
import type {RegistryEntry} from '@/registry/types';

import './CustomerProfile.scss';
import {DigitalAddressFields} from './subFields';

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
        {digitalAddressTypes.map(digitalAddressType => {
          const Component = DigitalAddressFields[digitalAddressType];
          const digitalAddress = digitalAddresses[digitalAddressType];

          return (
            <Component
              key={digitalAddressType}
              namePrefix={key}
              isRequired={isRequired}
              digitalAddressGroup={digitalAddress}
            />
          );
        })}
      </div>
      <HelpText id={descriptionId}>{description}</HelpText>
    </Fieldset>
  );
};

const CustomerProfileComponent: RegistryEntry<CustomerProfileComponentSchema> = {
  formField: FormioCustomerProfile,
};

export default CustomerProfileComponent;
