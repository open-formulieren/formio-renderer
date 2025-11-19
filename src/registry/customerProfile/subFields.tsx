import type {DigitalAddressType} from '@open-formulieren/types';
import {ButtonGroup} from '@utrecht/button-group-react';
import {useFormikContext} from 'formik';
import {useEffect, useState} from 'react';
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
 * The user can choose to add a new digital address, which swaps the select input for a
 * text input.
 *
 * Only for new digital addresses can the user update their preferences. Otherwise, the
 * user will have to use the online portal (outside of Open Forms).
 *
 * @param namePrefix The name prefix for the fields.
 * @param type The type of digital address field.
 * @param isRequired Whether the fields are required.
 * @param digitalAddressGroup The digital address group to display.
 * @param textfieldProps Additional props to pass to the text input.
 */
const DigitalAddressField: React.FC<DigitalAddressFieldProps> = ({
  namePrefix,
  type,
  isRequired,
  digitalAddressGroup,
  textfieldProps,
}) => {
  const {setFieldValue, getFieldMeta} = useFormikContext();
  const intl = useIntl();
  const fieldName = `${namePrefix}.address`;

  const {value, touched, error} = getFieldMeta(fieldName);

  // If there are no addresses yet, we show a text input.
  const hasAddresses = !!digitalAddressGroup?.addresses?.length;
  const [useTextInput, setUseTextInput] = useState(!hasAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const invalid = touched && !!error;
  const showPreferencesButton = touched && !invalid && value !== '';

  const fieldLabelMessage = FIELD_LABELS[type];

  // When the digital addresses are loaded, we check if we need to show a text input.
  useEffect(() => {
    setUseTextInput(!hasAddresses);
  }, [hasAddresses]);

  // If it has addresses, we show the select input.
  if (hasAddresses && !useTextInput) {
    const options = getDigitalAddressOptions(intl, digitalAddressGroup);
    return (
      <>
        <Select
          name={fieldName}
          label={<FormattedMessage {...fieldLabelMessage} />}
          options={options}
          isRequired={isRequired}
          optionComponent={OptionWithDescription}
          isDisabled={options.length === 1}
        />
        <ButtonGroup>
          <SecondaryActionButton
            onClick={() => {
              setUseTextInput(true);
              setFieldValue(fieldName, '');
              setFieldValue(`${namePrefix}.useOnlyOnce`, true);
            }}
          >
            <FormattedMessage {...ADD_DIGITAL_ADDRESS_BUTTON_LABELS[type]} />
          </SecondaryActionButton>
        </ButtonGroup>
      </>
    );
  }

  return (
    <>
      <TextField
        name={fieldName}
        label={<FormattedMessage {...fieldLabelMessage} />}
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
              setFieldValue(`${namePrefix}.preferenceUpdate`, newPreference);
              setIsModalOpen(false);
            }}
          />
        </>
      )}
    </>
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
