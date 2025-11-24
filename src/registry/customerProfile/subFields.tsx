import type {DigitalAddress, DigitalAddressType} from '@open-formulieren/types';
import {ButtonGroup} from '@utrecht/button-group-react';
import type {FormikErrors} from 'formik';
import {useFormikContext} from 'formik';
import {useEffect, useId, useState} from 'react';
import type {IntlShape} from 'react-intl';
import {FormattedMessage, defineMessages, useIntl} from 'react-intl';
import type {GroupBase, OptionProps} from 'react-select';
import {components} from 'react-select';

import {SecondaryActionButton} from '@/components/Button';
import {ValidationErrors} from '@/components/forms';
import Fieldset from '@/components/forms/Fieldset';
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
      !!digitalAddressGroup.preferred && address === digitalAddressGroup.preferred
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
  const {setFieldValue, getFieldMeta} = useFormikContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {value, touched, error} = getFieldMeta(fieldName);

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
              // Update the preference fields.
              setFieldValue(`${namePrefix}.isNewPreferred`, newPreference.isNewPreferred);
              setFieldValue(`${namePrefix}.useOnlyOnce`, newPreference.useOnlyOnce);
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
  const id = useId();
  const {setFieldValue, getFieldMeta} = useFormikContext();
  const fieldName = `${namePrefix}.address`;

  const {touched, error: formikError} = getFieldMeta(namePrefix);

  // If there are no addresses yet, we show a text input.
  const hasAddresses = !!digitalAddressGroup?.addresses?.length;
  const [useTextInput, setUseTextInput] = useState(!hasAddresses);

  const error = formikError as unknown as undefined | string | FormikErrors<DigitalAddress>;

  const fieldError = typeof error === 'string' && error;
  const invalid = touched && !!fieldError;

  const errorMessageId = invalid ? `${id}-error-message` : undefined;

  // When the digital addresses are loaded, we check if we need to show a text input.
  useEffect(() => {
    setUseTextInput(!hasAddresses);
  }, [hasAddresses]);

  return (
    <Fieldset
      isInvalid={invalid}
      aria-describedby={errorMessageId}
      className="openforms-customer-profile__digital-address-fieldset"
    >
      {hasAddresses && !useTextInput ? (
        <DigitalAddressesSelect
          type={type}
          fieldName={fieldName}
          onAddDigitalAddress={() => {
            setUseTextInput(true);
            setFieldValue(fieldName, '');
            setFieldValue(`${namePrefix}.useOnlyOnce`, true);
          }}
          digitalAddressGroup={digitalAddressGroup}
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
      {errorMessageId && fieldError && <ValidationErrors id={errorMessageId} error={fieldError} />}
    </Fieldset>
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
