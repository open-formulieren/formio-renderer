import {InputGroupItem} from '@/components/forms/InputGroup';

import type {TimePart} from '../types';
import TimePartInput from './TimePartInput';

export interface TimeInputItemsProps {
  /**
   * Day part of the date, entered by the user. We can't guarantee at the type level
   * that it will be a number from 1-31.
   */
  hour: string;
  /**
   * Month part of the date, entered by the user.
   * Keep in mind that this is the JS date month, so January is '0'.
   */
  minute: string;
  /**
   * Year part of the date, entered by the user.
   */
  second: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  autoComplete?: string;
}

const TimeInputItems: React.FC<TimeInputItemsProps> = ({
  hour,
  minute,
  second,
  isDisabled,
  onChange,
  onBlur,
  autoComplete,
}) => {
  const commonProps = {isDisabled, onChange, onBlur, autoComplete};

  const partsOrder: TimePart[] = ['hour', 'minute', 'second'];
  const parts: Record<TimePart, React.ReactElement> = {
    hour: <TimePartInput name="hour" value={hour} {...commonProps} />,
    minute: <TimePartInput name="minute" value={minute} {...commonProps} />,
    second: <TimePartInput name="second" value={second} {...commonProps} />,
  };

  return (
    <>
      {partsOrder.map(part => (
        <InputGroupItem key={part}>{parts[part]}</InputGroupItem>
      ))}
    </>
  );
};

export default TimeInputItems;
