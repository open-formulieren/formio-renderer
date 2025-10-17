import {InputGroupItem} from '@/components/forms/InputGroup';

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
  return (
    <>
      <InputGroupItem>
        <TimePartInput name="hour" value={hour} {...commonProps} />
      </InputGroupItem>
      <InputGroupItem>
        <TimePartInput name="minute" value={minute} {...commonProps} />
      </InputGroupItem>
    </>
  );
};

export default TimeInputItems;
