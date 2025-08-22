import {Paragraph, Textbox} from '@utrecht/component-library-react';
import {formatISO} from 'date-fns';
import {useField, useFormikContext} from 'formik';
import {useId, useState} from 'react';
import {flushSync} from 'react-dom';
import {useIntl} from 'react-intl';

import {FloatingWidget, useFloatingWidget} from '@/components/forms/FloatingWidget';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';

import {useDateLocaleMeta} from '../hooks';
import {parseDate, orderByPart} from '../utils';
import './DatePicker.scss';
import DatePickerCalendar from './DatePickerCalendar';
import {PART_PLACEHOLDERS} from '../messages';

interface DatePickerProps {
  /**
   * The name of the form field/input, used to set/track the field value in the form state.
   */
  name: string;
  /**
   * The (accessible) label for the field - anything that can be rendered.
   *
   * You must always provide a label to ensure the field is accessible to users of
   * assistive technologies.
   */
  label: React.ReactNode;
  /**
   * Optional tooltip to provide additional information that is not crucial but may
   * assist users in filling out the field correctly.
   */
  tooltip?: React.ReactNode;
  /**
   * Required fields get additional markup/styling to indicate this validation requirement.
   */
  isRequired?: boolean;
  /**
   * Disabled fields get marked as such in an accessible manner.
   */
  isDisabled?: boolean;
  'aria-describedby'?: string;
  /**
   * Dates before this value will be unavailable for selection.
   */
  minDate?: Date;
  /**
   * Dates after this value will be unavailable for selection.
   */
  maxDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
  name,
  label,
  tooltip,
  isRequired,
  isDisabled,
  'aria-describedby': ariaDescribedBy,
  minDate,
  maxDate,
}) => {
  // TODO-82: would it be nice to have Formio's behaviour: __-__-____? Or better to not do
  //  this to also enable dates such as 1-1-2000 for example?

  const id = useId();
  const {formatDate, formatMessage} = useIntl();
  const [inputValue, setInputValue] = useState('');
  const {validateField} = useFormikContext();
  // value is an ISO-8601 string _if_ a valid date was provided at some point.
  const [{value, onBlur, onChange}, {error, touched}, {setTouched, setValue}] =
    useField<string>(name);
  const {
    refs,
    floatingStyles,
    context,
    getFloatingProps,
    getReferenceProps,
    isOpen,
    setIsOpen,
    arrowRef,
  } = useFloatingWidget();
  const dateLocaleMeta = useDateLocaleMeta();

  const placeholderParts = orderByPart(
    {
      day: formatMessage(PART_PLACEHOLDERS.day),
      month: formatMessage(PART_PLACEHOLDERS.month),
      year: formatMessage(PART_PLACEHOLDERS.year),
    },
    dateLocaleMeta
  );
  const placeholder = placeholderParts.join(dateLocaleMeta.separator);

  const currentDate = parseDate(value);
  const textboxValue =
    currentDate !== null
      ? formatDate(currentDate, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        })
      : inputValue;

  // TODO-82: do we also want the calender icon like our custom datepicker, or should we leave it
  //  out like the formio one?
  return (
    <>
      <Label
        id={id}
        isRequired={isRequired}
        isDisabled={isDisabled}
        tooltip={tooltip ? <Tooltip>{tooltip}</Tooltip> : undefined}
      >
        {label}
      </Label>
      <Paragraph>
        <Textbox
          value={textboxValue}
          onChange={async event => {
            const enteredText = event.target.value;
            setInputValue(enteredText);

            console.log('entered text:', enteredText);

            // TODO-82: still something is going wrong with typing here... entering '22' immediately
            //  sets the field to '1-1-2200'
            const newDate = parseDate(enteredText);
            console.log('new date:', newDate);
            // if we couldn't parse a valid date -> clear the value in the formik state
            // (hitting backspace, deleting the input value completely...)
            if (!newDate) {
              await setValue('');
              return;
            }

            const enteredDate = formatISO(newDate, {representation: 'date'});
            await setValue(enteredDate);
          }}
          onBlur={async e => {
            onBlur(e);
            await validateField(name);
          }}
          className="utrecht-textbox--openforms"
          id={id}
          disabled={isDisabled}
          invalid={touched && !!error}
          aria-describedby={ariaDescribedBy}
          placeholder={placeholder}
          ref={refs.setReference}
          {...getReferenceProps()}
        />
        <FloatingWidget
          isOpen={isOpen}
          context={context}
          setFloating={refs.setFloating}
          floatingStyles={floatingStyles}
          getFloatingProps={getFloatingProps}
          arrowRef={arrowRef}
        >
          <DatePickerCalendar
            onCalendarClick={selectedDate => {
              flushSync(() => {
                const truncated = selectedDate.substring(0, 10);
                // const event = {target: {name, value: truncated}};
                setValue(truncated);
                // extraOnChange?.(event);
                setIsOpen(false, undefined, undefined, {keepDismissed: true});
              });
              setTouched(true);
            }}
            currentDate={currentDate ?? undefined}
            minDate={minDate}
            maxDate={maxDate}
          />
        </FloatingWidget>
      </Paragraph>
    </>
  );
};

export default DatePicker;
