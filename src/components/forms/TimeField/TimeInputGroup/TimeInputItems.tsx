import {InputGroupItem} from '@/components/forms/InputGroup';

import type {TimeInputPart} from '../types';
import TimePartInput from './TimePartInput';

export interface TimeInputItemsProps {
  /**
   * Hour part of the time, entered by the user. We can't guarantee at the type level
   * that it will be a number from 0-23.
   */
  hour: string;
  /**
   * Minute part of the time, entered by the user.
   */
  minute: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  autoComplete?: string;
}

const TimeInputItems: React.FC<TimeInputItemsProps> = ({
  hour,
  minute,
  isDisabled,
  onChange,
  onBlur,
  autoComplete,
}) => {
  const commonProps = {isDisabled, onChange, onBlur, autoComplete};

  const partsOrder: TimeInputPart[] = ['hour', 'minute'];
  const parts: Record<TimeInputPart, React.ReactElement> = {
    hour: <TimePartInput name="hour" value={hour} {...commonProps} />,
    minute: <TimePartInput name="minute" value={minute} {...commonProps} />,
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
