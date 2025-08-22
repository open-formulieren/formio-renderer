import {type MessageDescriptor, defineMessages} from 'react-intl';

import type {DatePart} from './types';

const PART_PLACEHOLDERS: Record<DatePart, MessageDescriptor> = defineMessages({
  year: {
    description: 'Placeholder for year part of a date',
    defaultMessage: 'yyyy',
  },
  month: {description: 'Placeholder for month part of a date', defaultMessage: 'm'},
  day: {description: 'Placeholder for day part of a date', defaultMessage: 'd'},
});

export {PART_PLACEHOLDERS};
