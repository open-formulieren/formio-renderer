import type {ChildDetails} from '@open-formulieren/types';
import {FormattedMessage, defineMessages} from 'react-intl';

import DateField from '@/components/forms/DateField';
import TextField from '@/components/forms/TextField';

export const FIELD_LABELS = defineMessages<keyof ChildDetails>({
  bsn: {description: 'Children component: label for children BSN', defaultMessage: 'BSN'},
  firstNames: {
    description: 'Children component: label for children firstNames',
    defaultMessage: 'Firstnames',
  },
  dateOfBirth: {
    description: 'Children component: label for children dateOfBirth',
    defaultMessage: 'Date of birth',
  },
});

interface BSNProps {
  namePrefix: string;
}

export const BSN: React.FC<BSNProps> = ({namePrefix}) => (
  <TextField
    name={`${namePrefix}.bsn`}
    label={<FormattedMessage {...FIELD_LABELS.bsn} />}
    isRequired
    pattern="[0-9]{9}"
    inputMode="numeric"
    placeholder="XXXXXXXXX"
  />
);

interface FirstNamesProps {
  namePrefix: string;
}

export const FirstNames: React.FC<FirstNamesProps> = ({namePrefix}) => (
  <TextField
    name={`${namePrefix}.firstNames`}
    label={<FormattedMessage {...FIELD_LABELS.firstNames} />}
  />
);

interface DateOfBirthProps {
  namePrefix: string;
}

export const DateOfBirth: React.FC<DateOfBirthProps> = ({namePrefix}) => (
  <DateField
    name={`${namePrefix}.dateOfBirth`}
    label={<FormattedMessage {...FIELD_LABELS.dateOfBirth} />}
    isRequired
    widget="inputGroup"
  />
);
