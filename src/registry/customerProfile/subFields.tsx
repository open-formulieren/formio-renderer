import type {DigitalAddressType} from '@open-formulieren/types';
import type {IntlShape} from 'react-intl';
import {FormattedMessage, defineMessages, useIntl} from 'react-intl';

import Select from '@/components/forms/Select';
import type {Option} from '@/components/forms/Select/Select';
import TextField from '@/components/forms/TextField';

import type {DigitalAddressGroup} from './types';

export const FIELD_LABELS = defineMessages({
  email: {
    description: 'Label for customerProfile email input',
    defaultMessage: 'Email',
  },
  phoneNumber: {
    description: 'Label for customerProfile phoneNumber input',
    defaultMessage: 'Phone number',
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
            defaultMessage: 'Preferred address',
          })
        : undefined,
  }));

interface DigitalAddressFieldProps {
  namePrefix: string;
  isRequired?: boolean;
  digitalAddressGroup?: DigitalAddressGroup;
}

export const EmailField: React.FC<DigitalAddressFieldProps> = ({
  namePrefix,
  isRequired,
  digitalAddressGroup,
}) => {
  const intl = useIntl();

  // If it has addresses, we show the select input.
  if (digitalAddressGroup?.addresses?.length) {
    const options = getDigitalAddressOptions(intl, digitalAddressGroup);
    return (
      <Select
        name={`${namePrefix}.email`}
        label={<FormattedMessage {...FIELD_LABELS.email} />}
        options={options}
        isRequired={isRequired}
      />
    );
  }

  return (
    <TextField
      name={`${namePrefix}.email`}
      label={<FormattedMessage {...FIELD_LABELS.email} />}
      type="email"
      autoComplete="email"
      isRequired={isRequired}
    />
  );
};

export const PhoneNumberField: React.FC<DigitalAddressFieldProps> = ({
  namePrefix,
  isRequired,
  digitalAddressGroup,
}) => {
  const intl = useIntl();

  // If it has addresses, we show the select input.
  if (digitalAddressGroup?.addresses?.length) {
    const options = getDigitalAddressOptions(intl, digitalAddressGroup);
    return (
      <Select
        name={`${namePrefix}.phoneNumber`}
        label={<FormattedMessage {...FIELD_LABELS.phoneNumber} />}
        options={options}
        isRequired={isRequired}
      />
    );
  }

  return (
    <TextField
      name={`${namePrefix}.phoneNumber`}
      label={<FormattedMessage {...FIELD_LABELS.phoneNumber} />}
      pattern="^[+0-9][\- 0-9]+$"
      inputMode="tel"
      autoComplete="tel"
      isRequired={isRequired}
    />
  );
};

export const DigitalAddressFields: Record<
  DigitalAddressType,
  React.FC<DigitalAddressFieldProps>
> = {
  email: EmailField,
  phoneNumber: PhoneNumberField,
};
