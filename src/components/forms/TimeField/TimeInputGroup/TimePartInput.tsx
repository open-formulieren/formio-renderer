import {FormLabel, Textbox} from '@utrecht/component-library-react';
import {useId} from 'react';
import {FormattedMessage, type MessageDescriptor, defineMessages, useIntl} from 'react-intl';

import PART_PLACEHOLDERS from '../messages';
import type {TimePart} from '../types';
import './TimePartInput.scss';

const PART_LABELS: Record<TimePart, MessageDescriptor> = defineMessages({
  hour: {
    description: 'Time input group: hour label',
    defaultMessage: 'Hour',
  },
  minute: {
    description: 'Time input group: minute label',
    defaultMessage: 'Minute',
  },
  second: {
    description: 'Time input group: second label',
    defaultMessage: 'Second',
  },
});

export interface TimePartInputProps {
  name: TimePart;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  autoComplete?: string;
}

/**
 * An input element for a single part of a time in a split input group.
 *
 * This components covers all two parts of a time: hour and minute.
 */
const TimePartInput: React.FC<TimePartInputProps> = ({
  name,
  value,
  onChange,
  isDisabled,
  onBlur,
  autoComplete,
}) => {
  const intl = useIntl();
  const id = useId();

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
        className={`utrecht-textbox--openforms utrecht-textbox--openforms-time-${name}`}
        disabled={isDisabled}
        placeholder={intl.formatMessage(PART_PLACEHOLDERS[name])}
        onBlur={onBlur}
        autoComplete={autoComplete}
      />
    </>
  );
};

export default TimePartInput;
