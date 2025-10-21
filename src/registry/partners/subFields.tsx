import type {PartnerDetails} from '@open-formulieren/types';
import {FormattedMessage, defineMessages} from 'react-intl';

import DateField from '@/components/forms/DateField';
import TextField from '@/components/forms/TextField';

export const FIELD_LABELS = defineMessages<keyof PartnerDetails>({
  bsn: {description: 'Partners component: label for partners BSN', defaultMessage: 'BSN'},
  initials: {
    description: 'Partners component: label for partners initials',
    defaultMessage: 'Initials',
  },
  affixes: {
    description: 'Partners component: label for partners affixes',
    defaultMessage: 'Affixes',
  },
  lastName: {
    description: 'Partners component: label for partners lastName',
    defaultMessage: 'Lastname',
  },
  dateOfBirth: {
    description: 'Partners component: label for partners dateOfBirth',
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

interface InitialsProps {
  namePrefix: string;
}

export const Initials: React.FC<InitialsProps> = ({namePrefix}) => (
  <TextField
    name={`${namePrefix}.initials`}
    label={<FormattedMessage {...FIELD_LABELS.initials} />}
  />
);

interface AffixesProps {
  namePrefix: string;
}

export const Affixes: React.FC<AffixesProps> = ({namePrefix}) => (
  <TextField
    name={`${namePrefix}.affixes`}
    label={<FormattedMessage {...FIELD_LABELS.affixes} />}
  />
);

interface LastNameProps {
  namePrefix: string;
}

export const LastName: React.FC<LastNameProps> = ({namePrefix}) => (
  <TextField
    name={`${namePrefix}.lastName`}
    label={<FormattedMessage {...FIELD_LABELS.lastName} />}
    isRequired
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
