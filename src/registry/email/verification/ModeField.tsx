import {useMemo} from 'react';
import {FormattedMessage, defineMessage, useIntl} from 'react-intl';
import type {MessageDescriptor} from 'react-intl';

import {RadioField} from '@/components/forms';

import type {Mode} from './types';

interface Option {
  value: Mode;
  label: MessageDescriptor;
}

const MODE_OPTIONS: Option[] = [
  {
    value: 'sendCode',
    label: defineMessage({
      description: 'Email verification mode selection: send code label',
      defaultMessage: 'Receive a verification code',
    }),
  },
  {
    value: 'enterCode',
    label: defineMessage({
      description: 'Email verification mode selection: enter code label',
      defaultMessage: 'Enter the verification code',
    }),
  },
];

const ModeField: React.FC = () => {
  const intl = useIntl();
  const options = useMemo(
    () => MODE_OPTIONS.map(({value, label}) => ({value, label: intl.formatMessage(label)})),
    [intl]
  );
  return (
    <RadioField
      name="mode"
      isRequired
      label={
        <FormattedMessage
          description="Email verification mode selection label"
          defaultMessage="What would you like to do?"
        />
      }
      options={options}
    />
  );
};

export default ModeField;
