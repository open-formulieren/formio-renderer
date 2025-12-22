import {Fieldset, FieldsetLegend} from '@utrecht/component-library-react';
import {clsx} from 'clsx';
import {useField, useFormikContext} from 'formik';
import {useEffect, useId, useLayoutEffect, useRef} from 'react';

import HelpText from '@/components/forms/HelpText';
import {LabelContent} from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';
import {useFieldConfig} from '@/hooks';

import './RadioField.scss';
import RadioOption from './RadioOption';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
}

interface BasicRadioFieldProps {
  /**
   * The name of the form field/input, used to set/track the field value in the form state.
   */
  name: string;
  /**
   * Required fields get additional markup/styling to indicate this validation requirement.
   */
  isRequired?: boolean;
  /**
   * Readonly fields get marked as such in an accessible manner.
   */
  isReadOnly?: boolean;
  /**
   * Additional description displayed close to the field - use this to document any
   * validation requirements that are crucial to successfully submit the form. More
   * information that is contextual/background typically belongs in a tooltip.
   */
  description?: React.ReactNode;
  /**
   * Array of possible choices for the field. Only one can be selected.
   */
  options: RadioOption[];
}

type RadioFieldWithLabelProps = BasicRadioFieldProps & {
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
  'aria-describedby'?: never;
};

type RadioFieldWithAriaLabelProps = BasicRadioFieldProps & {
  label?: never;
  tooltip?: never;
  /**
   * Aria-describedby attribute to provide additional information to accessibility tooling.
   *
   * Use aria-describedby for labelless radio fields.
   */
  'aria-describedby': string;
};

export type RadioFieldProps = RadioFieldWithLabelProps | RadioFieldWithAriaLabelProps;

/**
 * A radio field with a set of options.
 *
 * @reference https://nl-design-system.github.io/utrecht/storybook-react/?path=/docs/react-component-form-field-radio-group--docs
 */
const RadioField: React.FC<RadioFieldProps> = ({
  name,
  label = '',
  ['aria-describedby']: ariaDescribedby,
  isRequired = false,
  description = '',
  isReadOnly = false,
  options = [],
  tooltip,
}) => {
  name = useFieldConfig(name);
  const {validateField, getFieldProps} = useFormikContext();
  const [, {error = '', touched}] = useField<string>({name, type: 'radio'});
  const id = useId();

  const fieldsetRef = useRef<HTMLDivElement | null>(null);
  const lastValidatedValueRef = useRef<string>('');

  // we can't set the aria-readonly prop on the Fieldset component, as it's not forwarded
  // to the underlying fieldset element - see:
  // https://github.com/nl-design-system/utrecht/issues/3006
  useLayoutEffect(() => {
    const fieldsetElement = fieldsetRef.current?.querySelector('fieldset');
    if (!fieldsetElement) return;
    fieldsetElement.ariaReadOnly = isReadOnly ? 'true' : null;
  }, [isReadOnly]);

  // track the focus state of the fieldset and its radio children - when the field(set)
  // as a whole loses focus we can validate the field 'on blur'. Validating on blur of
  // an individual radio input results in errors being displayed while the user is
  // navigating with the keyboard.
  // See also: the selectboxes implementation, which is a more complex variant but uses
  // the same pattern.
  useEffect(() => {
    const container = fieldsetRef.current;
    if (!container) return;

    // extract the latest value without depending on the value state, as that would
    // re-run the useEffect hook due to a changed dependency.
    const {value} = getFieldProps<string>(name);

    // Run validation only if the value has changed since the last validate call.
    const maybeRunValidation = () => {
      const hasChanged = value !== lastValidatedValueRef.current;
      if (!hasChanged) return;
      // moving on to other components without even touching this field should not
      // trigger validation - other components only activate `onBlur` too, which implies
      // 'touched'
      if (!touched) return;

      validateField(name);
      lastValidatedValueRef.current = value;
    };

    const handleClick = (event: MouseEvent) => {
      const clickedElement = event.target;
      // ignore clicking inputs or labels, as they result in focus events which we
      // already listen to.
      // we deliberately also accept clicks on elements inside the container, since
      // clicking any element inside the container also results in focus loss.
      if (clickedElement instanceof HTMLLabelElement || clickedElement instanceof HTMLInputElement)
        return;
      // any other element (anywhere) being clicked triggers validation, as focus loss
      // is implied
      maybeRunValidation();
    };

    /**
     * Detect focus events on anything other than elements inside the fieldset container.
     *
     * Receiving this event means that some node got focus - if it's outside of our
     * container we can trigger validation because we're 100% certain that the container
     * does not have focus.
     */
    const handleFocusIn = (event: FocusEvent) => {
      const focusedElement = event.target;
      if (container.contains(focusedElement as Node)) return;
      maybeRunValidation();
    };

    // we subscribe to global events because we need to know whether the focus shifted
    // away from our component
    document.addEventListener('click', handleClick);
    document.addEventListener('focusin', handleFocusIn);
    // no focusout event support to detect focus shift because of programmatic blurs,
    // as browser support is only partial and it's quite a theoretical edge case
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [getFieldProps, validateField, name, touched]);

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <Fieldset
      ref={fieldsetRef}
      className="utrecht-form-fieldset--openforms"
      invalid={invalid}
      role="radiogroup"
      aria-describedby={[descriptionId, ariaDescribedby].filter(Boolean).join(' ')}
    >
      {label && (
        <FieldsetLegend
          className={clsx({'utrecht-form-fieldset__legend--openforms-tooltip': !!tooltip})}
        >
          <LabelContent isDisabled={isReadOnly} isRequired={isRequired} noLabelTag>
            {label}
          </LabelContent>
          {tooltip && <Tooltip>{tooltip}</Tooltip>}
        </FieldsetLegend>
      )}

      {options.map(({value, label: optionLabel, description}, index) => (
        <RadioOption
          key={value}
          name={name}
          value={value}
          label={optionLabel}
          description={description}
          id={id}
          index={index}
          aria-describedby={errorMessageId}
          isReadOnly={isReadOnly}
        />
      ))}

      <HelpText id={descriptionId}>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </Fieldset>
  );
};

RadioField.displayName = 'RadioField';

export default RadioField;
