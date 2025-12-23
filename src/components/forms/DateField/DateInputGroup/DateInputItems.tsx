import {InputGroupItem} from '@/components/forms/InputGroup';

import {useDateLocaleMeta} from '../hooks';
import type {DatePart} from '../types';
import DatePartInput from './DatePartInput';

export interface DateInputItemsProps {
  /**
   * Day part of the date, entered by the user. We can't guarantee at the type level
   * that it will be a number from 1-31.
   */
  day: string;
  /**
   * Month part of the date, entered by the user.
   * Keep in mind that this is the JS date month, so January is '0'.
   */
  month: string;
  /**
   * Year part of the date, entered by the user.
   */
  year: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  isReadOnly?: boolean;
  autoComplete?: string;
}

const DateInputItems: React.FC<DateInputItemsProps> = ({
  day,
  month,
  year,
  isReadOnly,
  onChange,
  onBlur,
  autoComplete,
}) => {
  const {partsOrder} = useDateLocaleMeta();
  const commonProps = {isReadOnly, onChange, onBlur, autoComplete};

  const parts: Record<DatePart, React.ReactElement> = {
    day: <DatePartInput name="day" value={day} {...commonProps} />,
    month: <DatePartInput name="month" value={month} {...commonProps} />,
    year: <DatePartInput name="year" value={year} {...commonProps} />,
  };

  return (
    <>
      {partsOrder.map(part => (
        <InputGroupItem key={part}>{parts[part]}</InputGroupItem>
      ))}
    </>
  );
};

export default DateInputItems;
