import {defineMessages} from 'react-intl';
import type {MessageDescriptor} from 'react-intl';

import type {DateTimePartValues} from './types';

const PART_PLACEHOLDERS: Record<keyof Omit<DateTimePartValues, 'second'>, MessageDescriptor> =
  defineMessages({
    year: {
      description: 'Placeholder for year part of a date',
      defaultMessage: 'yyyy',
    },
    month: {description: 'Placeholder for month part of a date', defaultMessage: 'm'},
    day: {description: 'Placeholder for day part of a date', defaultMessage: 'd'},
    hour: {description: 'Placeholder for the hour part of the time', defaultMessage: 'HH'},
    minute: {description: 'Placeholder for the minute part of the time', defaultMessage: 'MM'},
  });

export {PART_PLACEHOLDERS};
