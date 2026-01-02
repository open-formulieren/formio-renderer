import type {ChildDetails} from '@open-formulieren/types/dist/components/children';
import {FormattedMessage, defineMessages} from 'react-intl';

import DateField from '@/components/forms/DateField';
import TextField from '@/components/forms/TextField';

export const FIELD_LABELS = defineMessages<Exclude<keyof ChildDetails, 'selected'>>({
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

export const BSNField: React.FC = () => (
  <TextField
    name="bsn"
    label={<FormattedMessage {...FIELD_LABELS.bsn} />}
    isRequired
    pattern="[0-9]{9}"
    inputMode="numeric"
    placeholder="XXXXXXXXX"
  />
);

export const FirstNamesField: React.FC = () => (
  <TextField
    name="firstNames"
    label={<FormattedMessage {...FIELD_LABELS.firstNames} />}
    isRequired
  />
);

export const DateOfBirthField: React.FC = () => (
  <DateField
    name="dateOfBirth"
    label={<FormattedMessage {...FIELD_LABELS.dateOfBirth} />}
    isRequired
    widget="inputGroup"
  />
);
