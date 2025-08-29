import {FormLabel, Textbox} from '@utrecht/component-library-react';
import {useId} from 'react';
import {FormattedMessage, type MessageDescriptor, defineMessages, useIntl} from 'react-intl';

import './DatePartInput.scss';
import {PART_PLACEHOLDERS} from './messages';
import type {DatePart} from './types';

const PART_LABELS: Record<DatePart, MessageDescriptor> = defineMessages({
  year: {
    description: 'Date input group: year label',
    defaultMessage: 'Year',
  },
  month: {
    description: 'Date input group: month label',
    defaultMessage: 'Month',
  },
  day: {
    description: 'Date input group: day label',
    defaultMessage: 'Day',
  },
});

export interface DatePartInputProps {
  name: DatePart;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  autoComplete?: string;
}

/**
 * An input element for a single part of a date in a split input group.
 *
 * This components covers all three parts of a date: day, month and year. Note that if
 * for the parent date field the autocmplete 'bday' is given, it will be translated into
 * the individual autocomplete properties (bday-day, bday-month and bday-year).
 */
const DatePartInput: React.FC<DatePartInputProps> = ({
  name,
  value,
  onChange,
  isDisabled,
  onBlur,
  autoComplete,
}) => {
  const intl = useIntl();
  const id = useId();

  // if auto complete is set to bday, translate to the invidivual parts
  if (autoComplete === 'bday') {
    switch (name) {
      case 'day': {
        autoComplete = 'bday-day';
        break;
      }
      case 'month': {
        autoComplete = 'bday-month';
        break;
      }
      case 'year': {
        autoComplete = 'bday-year';
        break;
      }
    }
  }

  return (
    <>
      <FormLabel htmlFor={id} disabled={isDisabled} className="openforms-input-group__label">
        <FormattedMessage {...PART_LABELS[name]} />
      </FormLabel>
      <Textbox
        name={name}
        id={id}
        inputMode="numeric"
        value={value}
        onChange={onChange}
        className={`utrecht-textbox--openforms utrecht-textbox--openforms-date-${name}`}
        disabled={isDisabled}
        placeholder={intl.formatMessage(PART_PLACEHOLDERS[name])}
        onBlur={onBlur}
        autoComplete={autoComplete}
      />
    </>
  );
};

export default DatePartInput;
