import {type MessageDescriptor, defineMessages} from 'react-intl';

import type {TimePart} from './types';

const PART_PLACEHOLDERS: Record<TimePart, MessageDescriptor> = defineMessages({
  hour: {
    description: 'Placeholder for hour part of a time',
    defaultMessage: 'HH',
  },
  minute: {description: 'Placeholder for minute part of a time', defaultMessage: 'MM'},
  second: {description: 'Placeholder for second part of a time', defaultMessage: 'SS'},
});

export default PART_PLACEHOLDERS;
