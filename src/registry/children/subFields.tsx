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

export const BSN: React.FC = () => (
  <TextField
    name="bsn"
    label={<FormattedMessage {...FIELD_LABELS.bsn} />}
    isRequired
    pattern="[0-9]{9}"
    inputMode="numeric"
    placeholder="XXXXXXXXX"
  />
);

export const FirstNames: React.FC = () => (
  <TextField
    name="firstNames"
    isRequired
    label={<FormattedMessage {...FIELD_LABELS.firstNames} />}
  />
);

export const DateOfBirth: React.FC = () => (
  <DateField
    name="dateOfBirth"
    label={<FormattedMessage {...FIELD_LABELS.dateOfBirth} />}
    isRequired
    widget="inputGroup"
  />
);
