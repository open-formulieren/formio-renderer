import type {DigitalAddress, DigitalAddressType} from '@open-formulieren/types';
import {ButtonGroup} from '@utrecht/button-group-react';
import {useFormikContext} from 'formik';
import {useState} from 'react';
import type {IntlShape} from 'react-intl';
import {FormattedMessage, defineMessages, useIntl} from 'react-intl';
import type {GroupBase, OptionProps} from 'react-select';
import {components} from 'react-select';

import {SecondaryActionButton} from '@/components/Button';
import Select from '@/components/forms/Select';
import type {Option} from '@/components/forms/Select/Select';
import TextField from '@/components/forms/TextField';
import Icon from '@/components/icons';

import DigitalAddressPreferencesModal from './digitalAddressPreferencesModal';
import type {DigitalAddressGroup} from './types';

export const FIELD_LABELS = defineMessages<DigitalAddressType>({
  email: {
    description: 'Label for customerProfile email input',
    defaultMessage: 'Email',
  },
  phoneNumber: {
    description: 'Label for customerProfile phoneNumber input',
    defaultMessage: 'Phone number',
  },
});

export const ADD_DIGITAL_ADDRESS_BUTTON_LABELS = defineMessages<DigitalAddressType>({
  email: {
    description: "Profile digital address 'add email' button label",
    defaultMessage: 'Add email address',
  },
  phoneNumber: {
    description: "Profile digital address 'add phone number' button label",
    defaultMessage: 'Add phone number',
  },
});

interface DigitalAddressSubFieldProps {
  type: DigitalAddressType;
  fieldName: string;
  isRequired?: boolean;
}

/**
 * Turns an array of addresses into an array of options for a select component. If the
 * `preferredAddress` is provided, its corresponding select option will be marked as
 * preferred.
 */
const getDigitalAddressOptions = (
  intl: IntlShape,
  digitalAddressGroup: DigitalAddressGroup
): Option[] =>
  digitalAddressGroup.addresses.map(address => ({
    label: address,
    value: address,
    description:
      address === digitalAddressGroup.preferred
        ? intl.formatMessage({
            description: 'CustomerProfile: preferred digital address option description',
            defaultMessage: '(Preferred)',
          })
        : undefined,
  }));

const OptionWithDescription: React.FC<OptionProps<Option>> = props => {
  const {label, description} = props.data;
  return (
    <components.Option<Option, boolean, GroupBase<Option>> {...props}>
      <span className="openforms-customer-profile-option">
        {label}
        {description && (
          <span className="openforms-customer-profile-option__description">{description}</span>
        )}
      </span>
    </components.Option>
  );
};

interface DigitalAddressesSelectProps extends DigitalAddressSubFieldProps {
  onAddDigitalAddress: () => void;
  digitalAddressGroup: DigitalAddressGroup;
}

const DigitalAddressesSelect: React.FC<DigitalAddressesSelectProps> = ({
  type,
  fieldName,
  isRequired,
  digitalAddressGroup,
  onAddDigitalAddress,
}) => {
  const intl = useIntl();
  const options = getDigitalAddressOptions(intl, digitalAddressGroup);
  return (
    <>
      <Select
        name={fieldName}
        label={<FormattedMessage {...FIELD_LABELS[type]} />}
        options={options}
        isRequired={isRequired}
        optionComponent={OptionWithDescription}
        isDisabled={options.length === 1}
      />
      <ButtonGroup>
        <SecondaryActionButton onClick={onAddDigitalAddress}>
          <FormattedMessage {...ADD_DIGITAL_ADDRESS_BUTTON_LABELS[type]} />
        </SecondaryActionButton>
      </ButtonGroup>
    </>
  );
};

interface DigitalAddressTextfieldProps extends DigitalAddressSubFieldProps {
  namePrefix: string;
  textfieldProps: Partial<React.ComponentProps<typeof TextField>>;
}

const DigitalAddressTextfield: React.FC<DigitalAddressTextfieldProps> = ({
  type,
  namePrefix,
  fieldName,
  isRequired,
  textfieldProps,
}) => {
  const {getFieldHelpers, getFieldMeta} = useFormikContext<DigitalAddress>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {setValue: setPreference} = getFieldHelpers<DigitalAddress['preferenceUpdate']>(
    `${namePrefix}.preferenceUpdate`
  );

  const {value, touched, error} = getFieldMeta<DigitalAddress['address']>(fieldName);

  // Only show the preference button if the field is touched, has a value and has no error
  const showPreferencesButton = touched && !error && value !== '';

  return (
    <>
      <TextField
        name={fieldName}
        label={<FormattedMessage {...FIELD_LABELS[type]} />}
        isRequired={isRequired}
        {...textfieldProps}
      />
      {showPreferencesButton && (
        <>
          <ButtonGroup>
            <SecondaryActionButton onClick={() => setIsModalOpen(true)}>
              <FormattedMessage
                description="Profile digital address 'Update preferences' button label"
                defaultMessage="Update preferences"
              />
              <Icon icon="arrow-right" />
            </SecondaryActionButton>
          </ButtonGroup>
          <DigitalAddressPreferencesModal
            isOpen={isModalOpen}
            closeModal={() => setIsModalOpen(false)}
            onSubmit={newPreference => {
              // Update the preference field
              setPreference(newPreference);
              setIsModalOpen(false);
            }}
          />
        </>
      )}
    </>
  );
};

interface DigitalAddressTypeFieldProps {
  namePrefix: string;
  isRequired?: boolean;
  digitalAddressGroup?: DigitalAddressGroup;
}

interface DigitalAddressFieldProps extends DigitalAddressTypeFieldProps {
  type: DigitalAddressType;
  textfieldProps: Partial<React.ComponentProps<typeof TextField>>;
}

/**
 * A generic field for digital addresses. If there are no digital addresses yet, it shows
 * a text input, otherwise it shows a select input with the addresses as options.
 * The user can choose to add a new digital address, which replaces the select input for
 * the text input.
 *
 * Only for new digital addresses can the user update their preferences. Updating the
 * preference can be done in a modal, once the digital address textfield contains a valid
 * digital address. In other situations, the user will have to use the online portal
 * (outside of Open Forms) to update their preferences.
 */
const DigitalAddressField: React.FC<DigitalAddressFieldProps> = ({
  namePrefix,
  type,
  isRequired,
  digitalAddressGroup,
  textfieldProps,
}) => {
  const {getFieldHelpers} = useFormikContext<DigitalAddress>();
  const fieldName = `${namePrefix}.address`;
  const {setValue: setAddress} = getFieldHelpers<DigitalAddress['address']>(fieldName);
  const {setValue: setPreference} = getFieldHelpers<DigitalAddress['preferenceUpdate']>(
    `${namePrefix}.preferenceUpdate`
  );

  // When the digital addresses are loaded, we check if we need to show a text input.
  const hasAddresses = !!digitalAddressGroup?.addresses?.length;
  const [useTextInput, setUseTextInput] = useState(!hasAddresses);

  return (
    <div className="openforms-customer-profile-digital-address">
      {hasAddresses && !useTextInput ? (
        <DigitalAddressesSelect
          type={type}
          fieldName={fieldName}
          onAddDigitalAddress={() => {
            setUseTextInput(true);
            setAddress('');
            setPreference('useOnlyOnce');
          }}
          digitalAddressGroup={digitalAddressGroup as DigitalAddressGroup}
          isRequired={isRequired}
        />
      ) : (
        <DigitalAddressTextfield
          type={type}
          namePrefix={namePrefix}
          fieldName={fieldName}
          isRequired={isRequired}
          textfieldProps={textfieldProps}
        />
      )}
    </div>
  );
};

export const EmailField: React.FC<DigitalAddressTypeFieldProps> = props => (
  <DigitalAddressField
    type="email"
    textfieldProps={{
      type: 'email',
      autoComplete: 'email',
    }}
    {...props}
  />
);

export const PhoneNumberField: React.FC<DigitalAddressTypeFieldProps> = props => (
  <DigitalAddressField
    type="phoneNumber"
    textfieldProps={{
      pattern: '^[+0-9][- 0-9]+$',
      inputMode: 'tel',
      autoComplete: 'tel',
    }}
    {...props}
  />
);

export const DigitalAddressFields: Record<
  DigitalAddressType,
  React.FC<DigitalAddressTypeFieldProps>
> = {
  email: EmailField,
  phoneNumber: PhoneNumberField,
};
