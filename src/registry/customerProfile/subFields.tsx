import type {IntlShape} from 'react-intl';
import {FormattedMessage, defineMessages, useIntl} from 'react-intl';

import Select from '@/components/forms/Select';
import type {Option} from '@/components/forms/Select/Select';
import TextField from '@/components/forms/TextField';

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
  addresses: string[],
  preferredAddress?: string
): Option[] =>
  addresses.map(address => ({
    label: address,
    value: address,
    description:
      !!preferredAddress && address === preferredAddress
        ? intl.formatMessage({
            description: 'CustomerProfile: preferred digital address option description',
            defaultMessage: 'Preferred address',
          })
        : undefined,
  }));

interface EmailFieldProps {
  namePrefix: string;
  isRequired?: boolean;
  addresses?: string[];
  preferredAddress?: string;
}

export const EmailField: React.FC<EmailFieldProps> = ({
  namePrefix,
  isRequired,
  addresses,
  preferredAddress,
}) => {
  const intl = useIntl();

  // If it has addresses, we show a select.
  if (addresses?.length) {
    const options = getDigitalAddressOptions(intl, addresses, preferredAddress);
    return (
      <Select
        name={`${namePrefix}.email`}
        label={<FormattedMessage {...FIELD_LABELS.email} />}
        options={options}
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

interface PhoneNumberFieldProps {
  namePrefix: string;
  isRequired?: boolean;
  addresses?: string[];
  preferredAddress?: string;
}

export const PhoneNumberField: React.FC<PhoneNumberFieldProps> = ({
  namePrefix,
  isRequired,
  addresses,
  preferredAddress,
}) => {
  const intl = useIntl();

  // If it has addresses, we show a select.
  if (addresses?.length) {
    const options = getDigitalAddressOptions(intl, addresses, preferredAddress);
    return (
      <Select
        name={`${namePrefix}.phoneNumber`}
        label={<FormattedMessage {...FIELD_LABELS.phoneNumber} />}
        options={options}
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
