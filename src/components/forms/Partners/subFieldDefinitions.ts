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

export const PARTNER_BSN_COMPONENT = {
  id: 'bsn',
  type: 'bsn',
  key: 'bsn' as const,
  label: FIELD_LABELS.bsn,
  validate: {required: true},
  validateOn: 'blur',
  inputMask: '999999999',
} satisfies withLocalizedLabel<BsnComponentSchema>;

export const PARTNER_INITIALS_COMPONENT = {
  id: 'initials',
  type: 'textfield',
  key: 'initials' as const,
  label: FIELD_LABELS.initials,
  validate: {required: false},
} satisfies withLocalizedLabel<TextFieldComponentSchema>;

export const PARTNER_AFFIXES_COMPONENT = {
  id: 'affixes',
  type: 'textfield',
  key: 'affixes' as const,
  label: FIELD_LABELS.affixes,
  validate: {required: false},
} satisfies withLocalizedLabel<TextFieldComponentSchema>;

export const PARTNER_LAST_NAME_COMPONENT = {
  id: 'lastName',
  type: 'textfield',
  key: 'lastName' as const,
  label: FIELD_LABELS.lastname,
  validate: {required: true},
} satisfies withLocalizedLabel<TextFieldComponentSchema>;

export const PARTNER_DATE_OF_BIRTH_COMPONENT = {
  id: 'dateOfBirth',
  type: 'date',
  key: 'dateOfBirth' as const,
  label: FIELD_LABELS.dateOfBirth,
  validate: {
    required: true,
    minDate: subYears(today, 120).toISOString(),
    maxDate: subDays(today, 1).toISOString(),
  },
} satisfies withLocalizedLabel<DateComponentSchema>;

const PARTNER_COMPONENTS = [
  PARTNER_BSN_COMPONENT,
  PARTNER_INITIALS_COMPONENT,
  PARTNER_AFFIXES_COMPONENT,
  PARTNER_LAST_NAME_COMPONENT,
  PARTNER_DATE_OF_BIRTH_COMPONENT,
];

export default PARTNER_COMPONENTS;
