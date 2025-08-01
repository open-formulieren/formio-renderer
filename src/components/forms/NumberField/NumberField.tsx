import {FormField, Textbox} from '@utrecht/component-library-react';
import DOMPurify from 'dompurify';
import {useField, useFormikContext} from 'formik';
import {useId} from 'react';
import {useIntl} from 'react-intl';
import {NumericFormat} from 'react-number-format';

import HelpText from '@/components/forms/HelpText';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';

import './_input-container.scss';

export interface NumberFieldProps {
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
   * Required fields get additional markup/styling to indicate this validation requirement.
   */
  isRequired?: boolean;
  /**
   * Disabled fields get marked as such in an accessible manner.
   */
  isDisabled?: boolean;
  /**
   * Additional description displayed close to the field - use this to document any
   * validation requirements that are crucial to successfully submit the form. More
   * information that is contextual/background typically belongs in a tooltip.
   */
  description?: React.ReactNode;
  /**
   * Optional tooltip to provide additional information that is not crucial but may
   * assist users in filling out the field correctly.
   */
  tooltip?: React.ReactNode;
  /**
   * Maximum number of decimals of the input.
   */
  decimalLimit?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  /**
   * Whether negative values are allowed.
   */
  allowNegative?: boolean;
  /**
   * Indicator that describes the field value. It is placed before the value inside
   * the input field.
   */
  prefix?: string;
  /**
   * Indicator that describes the field value. It is placed to the right of the
   * input field and can contain HTML elements such as sub/sup. The value
   * will be sanitized first.
   */
  suffix?: string;
  /**
   * Whether to format the number with a thousand separator. Which separator to use
   * will be determined based on the locale.
   */
  useThousandSeparator?: boolean;
}

export interface Separators {
  decimalSeparator: string;
  thousandSeparator: string;
}

export const getSeparators = (locale: string): Separators => {
  const numberFormat = new Intl.NumberFormat(locale);
  // We get the separators by formatting an arbitrary number and extracting
  // them from the parts
  const parts = numberFormat.formatToParts(1000.1);
  // @ts-ignore value will not be undefined, because the number 1000.1 is guaranteed to give
  // both groups
  const decimalSeparator = parts.find(part => part.type === 'decimal').value;
  // @ts-ignore
  const thousandSeparator = parts.find(part => part.type === 'group').value;
  return {decimalSeparator, thousandSeparator};
};

const convertToNumber = (value: string, locale: string): number | null => {
  if (!value) return null;

  const {decimalSeparator, thousandSeparator} = getSeparators(locale);
  value = value.split(thousandSeparator).join('').replace(decimalSeparator, '.');
  return parseFloat(value);
};

const NumberField: React.FC<NumberFieldProps> = ({
  name,
  label,
  isRequired = false,
  description = '',
  isDisabled = false,
  tooltip,
  decimalLimit,
  allowNegative = false,
  prefix,
  suffix,
  useThousandSeparator = false,
  ...extraProps
}) => {
  const {validateField} = useFormikContext();
  const [{value, ...props}, {error = '', touched}, {setValue}] = useField<number | null>(name);
  const {locale} = useIntl();
  const id = useId();

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;

  // To make sure we save a number to the formik field, we need a custom onChange
  // handler to convert the string to a number
  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const parsed = convertToNumber(value, locale);
    await setValue(parsed);
  }

  const {decimalSeparator, thousandSeparator} = getSeparators(locale);
  //  Note on valueIsNumericString: passing it as true means that the string
  //  itself can be interpreted directly as a number, but we have the opposite
  //  in Dutch locale where the '.' character is the thousand separator.
  const valueIsNumericString = thousandSeparator !== '.';

  return (
    <FormField type="text" invalid={invalid} className="utrecht-form-field--openforms">
      <Label
        id={id}
        isRequired={isRequired}
        isDisabled={isDisabled}
        tooltip={tooltip ? <Tooltip>{tooltip}</Tooltip> : undefined}
      >
        {label}
      </Label>

      <div className="openforms-input-container">
        <NumericFormat
          value={value}
          {...props}
          onChange={onChange}
          onBlur={async e => {
            props.onBlur(e);
            await validateField(name);
          }}
          id={id}
          className="utrecht-textbox--openforms"
          readOnly={isDisabled}
          invalid={invalid}
          allowNegative={allowNegative}
          type="text"
          decimalScale={decimalLimit}
          decimalSeparator={decimalSeparator}
          thousandSeparator={useThousandSeparator ? thousandSeparator : undefined}
          prefix={prefix}
          valueIsNumericString={valueIsNumericString}
          customInput={Textbox}
          aria-describedby={errorMessageId}
          {...extraProps}
        />
        {suffix && (
          <span
            className="openforms-input-container__affix openforms-input-container__affix--suffix"
            dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(suffix)}}
          />
        )}
      </div>
      <HelpText>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </FormField>
  );
};

export default NumberField;
