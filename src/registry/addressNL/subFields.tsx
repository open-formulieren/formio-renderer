import {FormattedMessage, defineMessages} from 'react-intl';

import TextField from '@/components/forms/TextField';

export const FIELD_LABELS = defineMessages({
  postcode: {
    description: 'Label for addressNL postcode input',
    defaultMessage: 'Postcode',
  },
  houseNumber: {
    description: 'Label for addressNL houseNumber input',
    defaultMessage: 'House number',
  },
  houseLetter: {
    description: 'Label for addressNL houseLetter input',
    defaultMessage: 'House letter',
  },
  houseNumberAddition: {
    description: 'Label for addressNL houseNumberAddition input',
    defaultMessage: 'House number addition',
  },
  streetName: {
    description: 'Label for addressNL streetName read only result',
    defaultMessage: 'Street name',
  },
  city: {
    description: 'Label for addressNL city read only result',
    defaultMessage: 'City',
  },
});

interface PostCodeFieldProps {
  namePrefix: string;
  isRequired?: boolean;
}

export const PostCodeField: React.FC<PostCodeFieldProps> = ({namePrefix, isRequired}) => (
  <TextField
    name={`${namePrefix}.postcode`}
    label={<FormattedMessage {...FIELD_LABELS.postcode} />}
    placeholder="1234 AB"
    isRequired={isRequired}
  />
);

interface HouseNumberFieldProps {
  namePrefix: string;
  isRequired?: boolean;
}

export const HouseNumberField: React.FC<HouseNumberFieldProps> = ({namePrefix, isRequired}) => (
  <TextField
    name={`${namePrefix}.houseNumber`}
    label={<FormattedMessage {...FIELD_LABELS.houseNumber} />}
    inputMode="numeric"
    placeholder="123"
    isRequired={isRequired}
  />
);

interface HouseLetterProps {
  namePrefix: string;
}

export const HouseLetter: React.FC<HouseLetterProps> = ({namePrefix}) => (
  <TextField
    name={`${namePrefix}.houseLetter`}
    label={<FormattedMessage {...FIELD_LABELS.houseLetter} />}
  />
);

interface HouseNumberAdditionProps {
  namePrefix: string;
}

export const HouseNumberAddition: React.FC<HouseNumberAdditionProps> = ({namePrefix}) => (
  <TextField
    name={`${namePrefix}.houseNumberAddition`}
    label={<FormattedMessage {...FIELD_LABELS.houseNumberAddition} />}
  />
);

interface StreetNameProps {
  namePrefix: string;
  isRequired?: boolean;
  isReadOnly: boolean;
}

export const StreetName: React.FC<StreetNameProps> = ({namePrefix, isRequired, isReadOnly}) => (
  <TextField
    name={`${namePrefix}.streetName`}
    label={<FormattedMessage {...FIELD_LABELS.streetName} />}
    isRequired={isRequired}
    isReadOnly={isReadOnly}
  />
);

interface CityProps {
  namePrefix: string;
  isRequired?: boolean;
  isReadOnly: boolean;
}

export const City: React.FC<CityProps> = ({namePrefix, isRequired, isReadOnly}) => (
  <TextField
    name={`${namePrefix}.city`}
    label={<FormattedMessage {...FIELD_LABELS.city} />}
    isRequired={isRequired}
    isReadOnly={isReadOnly}
  />
);
