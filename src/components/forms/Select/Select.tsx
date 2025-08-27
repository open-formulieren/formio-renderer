import {FormField} from '@utrecht/component-library-react';
import {useField, useFormikContext} from 'formik';
import {useId} from 'react';
import type {MultiValue, SingleValue} from 'react-select';

import HelpText from '@/components/forms/HelpText';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';

import ReactSelectWrapper from './ReactSelectWrapper';

export interface Option {
  value: string;
  label: string;
  description?: string;
}

export interface SelectProps {
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
   * Available options for the select. Options *may* have a description.
   */
  options: Option[];
  /**
   * Allow multiple options selection or not.
   */
  isMulti?: boolean;
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
   * Formio compatibility - a select without any option chosen is represented as empty
   * string in Formio submission data, instead of `null` or `undefined`. The default
   * is to use `undefined` to remove the value from the Formik state entirely.
   */
  noOptionSelectedValue?: undefined | '';
}

const Select: React.FC<SelectProps> = ({
  name,
  label,
  options,
  isMulti = false,
  isRequired,
  isDisabled,
  description,
  tooltip,
  noOptionSelectedValue = undefined,
}) => {
  const {validateField} = useFormikContext();
  // TODO: deal with multiple values
  const [{value, ...props}, {error = '', touched}, {setValue}] = useField<
    string[] | string | undefined
  >(name);
  const id = useId();

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;

  // ensure that missing single values are converted to null, missing multi values are
  // converted to an empty array and otherwise we pass the value along as is.
  let wrapperValue: string | string[] | null;
  if (isMulti && !Array.isArray(value)) {
    wrapperValue = [];
  } else if (isMulti && Array.isArray(value)) {
    wrapperValue = value;
  } else {
    wrapperValue = value ?? null;
  }

  return (
    <FormField type="select" invalid={invalid} className="utrecht-form-field--openforms">
      <Label
        id={id}
        isRequired={isRequired}
        isDisabled={isDisabled}
        tooltip={tooltip ? <Tooltip>{tooltip}</Tooltip> : undefined}
      >
        {label}
      </Label>
      <ReactSelectWrapper<Option>
        name={name}
        inputId={id}
        options={options}
        isMulti={isMulti}
        isClearable={!isRequired}
        isRequired={isRequired}
        isDisabled={isDisabled}
        formikValue={wrapperValue}
        onChange={optionOrOptions => {
          let rawValue: string | string[] | undefined;
          // need to cast here because type narrowing doesn't work for the SingleValue | MultiValue
          // construct
          if (isMulti) {
            rawValue = (optionOrOptions as MultiValue<Option>).map(o => o.value);
          } else {
            // when it's null, the field is being cleared. Formio uses empty string when
            // there's no value selected, even though it's not an explicit option.
            rawValue = (optionOrOptions as SingleValue<Option>)?.value ?? noOptionSelectedValue;
          }
          setValue(rawValue);
        }}
        onBlur={async e => {
          props.onBlur(e);
          await validateField(name);
        }}
      />
      <HelpText>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </FormField>
  );
};

export default Select;
