import type {
  AnyComponentSchema,
  BsnComponentSchema,
  DateComponentSchema,
  TextFieldComponentSchema,
} from '@open-formulieren/types';
import {subDays, subYears} from 'date-fns';
import {type MessageDescriptor, defineMessage} from 'react-intl';

type withLocalizedLabel<S extends AnyComponentSchema> = Omit<S, 'label'> & {
  label: MessageDescriptor;
};

const today = new Date();

export const PARTNER_BSN_FIELD = {
  id: 'bsn',
  type: 'bsn',
  key: 'bsn' as const,
  label: defineMessage({description: 'Label for partners BSN', defaultMessage: 'BSN'}),
  validate: {required: true},
  validateOn: 'blur',
  inputMask: '999999999',
} satisfies withLocalizedLabel<BsnComponentSchema>;

export const PARTNER_INITIALS_FIELD = {
  id: 'initials',
  type: 'textfield',
  key: 'initials' as const,
  label: defineMessage({description: 'Label for partners initials', defaultMessage: 'Initials'}),
  validate: {required: false},
} satisfies withLocalizedLabel<TextFieldComponentSchema>;

export const PARTNER_AFFIXES_FIELD = {
  id: 'affixes',
  type: 'textfield',
  key: 'affixes' as const,
  label: defineMessage({description: 'Label for partners affixes', defaultMessage: 'Affixes'}),
  validate: {required: false},
} satisfies withLocalizedLabel<TextFieldComponentSchema>;

export const PARTNER_LAST_NAME_FIELD = {
  id: 'lastName',
  type: 'textfield',
  key: 'lastName' as const,
  label: defineMessage({description: 'Label for partners lastName', defaultMessage: 'Lastname'}),
  validate: {required: true},
} satisfies withLocalizedLabel<TextFieldComponentSchema>;

export const PARTNER_DATE_OF_BIRTH_FIELD = {
  id: 'dateOfBirth',
  type: 'date',
  key: 'dateOfBirth' as const,
  label: defineMessage({
    description: 'Label for partners dateOfBirth',
    defaultMessage: 'Date of birth',
  }),
  validate: {
    required: true,
    minDate: subYears(today, 120).toISOString(),
    maxDate: subDays(today, 1).toISOString(),
  },
} satisfies withLocalizedLabel<DateComponentSchema>;

const PARTNER_COMPONENTS = [
  PARTNER_BSN_FIELD,
  PARTNER_INITIALS_FIELD,
  PARTNER_AFFIXES_FIELD,
  PARTNER_LAST_NAME_FIELD,
  PARTNER_DATE_OF_BIRTH_FIELD,
];

export default PARTNER_COMPONENTS;
