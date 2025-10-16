import type {
  AnyComponentSchema,
  BsnComponentSchema,
  DateComponentSchema,
  TextFieldComponentSchema,
} from '@open-formulieren/types';
import {subDays, subYears} from 'date-fns';
import {defineMessages} from 'react-intl';
import type {MessageDescriptor} from 'react-intl';

type withLocalizedLabel<S extends AnyComponentSchema> = Omit<S, 'label'> & {
  label: MessageDescriptor;
};

const today = new Date();

export const FIELD_LABELS = defineMessages({
  bsn: {description: 'Partner component: label for partners BSN', defaultMessage: 'BSN'},
  initials: {
    description: 'Partner component: label for partners initials',
    defaultMessage: 'Initials',
  },
  affixes: {
    description: 'Partner component: label for partners affixes',
    defaultMessage: 'Affixes',
  },
  lastname: {
    description: 'Partner component: label for partners lastName',
    defaultMessage: 'Lastname',
  },
  dateOfBirth: {
    description: 'Partner component: label for partners dateOfBirth',
    defaultMessage: 'Date of birth',
  },
});

const PARTNER_COMPONENTS = [
  {
    id: 'bsn',
    type: 'bsn',
    key: 'bsn' as const,
    label: FIELD_LABELS.bsn,
    validate: {required: true},
    validateOn: 'blur',
    inputMask: '999999999',
  } satisfies withLocalizedLabel<BsnComponentSchema>,
  {
    id: 'initials',
    type: 'textfield',
    key: 'initials' as const,
    label: FIELD_LABELS.initials,
    validate: {required: false},
  } satisfies withLocalizedLabel<TextFieldComponentSchema>,
  {
    id: 'affixes',
    type: 'textfield',
    key: 'affixes' as const,
    label: FIELD_LABELS.affixes,
    validate: {required: false},
  } satisfies withLocalizedLabel<TextFieldComponentSchema>,
  {
    id: 'lastName',
    type: 'textfield',
    key: 'lastName' as const,
    label: FIELD_LABELS.lastname,
    validate: {required: true},
  } satisfies withLocalizedLabel<TextFieldComponentSchema>,
  {
    id: 'dateOfBirth',
    type: 'date',
    key: 'dateOfBirth' as const,
    label: FIELD_LABELS.dateOfBirth,
    validate: {
      required: true,
      minDate: subYears(today, 120).toISOString(),
      maxDate: subDays(today, 1).toISOString(),
    },
  } satisfies withLocalizedLabel<DateComponentSchema>,
];

export default PARTNER_COMPONENTS;
