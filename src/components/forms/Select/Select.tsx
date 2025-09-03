import {FormField} from '@utrecht/component-library-react';
import {useField, useFormikContext} from 'formik';
import {useEffect, useId} from 'react';
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
   * Indicator whether options are still being retrieved.
   */
  isLoading?: boolean;
  /**
   * If enabled and when there is only one possible option in the `options`,
   * automatically select it.
   */
  autoSelectOnlyOption?: boolean;
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

const EMPTY_MULTI_SELECT_VALUE: string[] = [];

const Select: React.FC<SelectProps> = ({
  name,
  label,
  isLoading,
  options,
  autoSelectOnlyOption,
  isMulti = false,
  isRequired,
  isDisabled,
  description,
  tooltip,
  noOptionSelectedValue = undefined,
}) => {
  const {validateField} = useFormikContext();
  const [{value}, {error = '', touched}, {setValue, setTouched}] = useField<
    string[] | string | undefined
  >(name);
  const id = useId();

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;

  // ensure that missing single values are converted to null, missing multi values are
  // converted to an empty array and otherwise we pass the value along as is.
  let wrapperValue: string | string[] | null;
  if (isMulti && !Array.isArray(value)) {
    wrapperValue = EMPTY_MULTI_SELECT_VALUE; // forces a stable reference
  } else if (isMulti && Array.isArray(value)) {
    wrapperValue = value;
  } else {
    wrapperValue = value ?? null;
  }

  useEffect(() => {
    // if the option is not enabled, do nothing
    if (!autoSelectOnlyOption) return;
    // if a value is set, do nothing either
    if ((Array.isArray(wrapperValue) && wrapperValue.length >= 1) || wrapperValue) return;
    // if there are not exactly one option, do nothing
    if (options.length !== 1) return;
    // otherwise update the value to the single option value
    const optionValue = options[0].value;
    setValue(isMulti ? [optionValue] : optionValue);
  }, [setValue, autoSelectOnlyOption, isMulti, wrapperValue, options]);

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
        isLoading={isLoading}
        options={options}
        isMulti={isMulti}
        isClearable={!isRequired && !(autoSelectOnlyOption && options.length === 1)}
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
        onBlur={async () => {
          // we need to manually set the field as touched because the search input does
          // not have the `name` of the actual field, which leads to another, unrelated,
          // name being marked as 'touched'
          // See https://github.com/jaredpalmer/formik/blob/0e0cf9ea09ec864dd63c52cf775f862795ef2cf4/packages/formik/src/Formik.tsx#L693
          // for the upstream code
          await setTouched(true);
          await validateField(name);
        }}
        aria-describedby={errorMessageId}
        aria-invalid={invalid ? invalid : undefined}
      />
      <HelpText>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </FormField>
  );
};

export default Select;
