import type {FAQItem} from '@open-formulieren/types';
import {Fieldset, FieldsetLegend} from '@utrecht/fieldset-react';
import {clsx} from 'clsx';
import {useField} from 'formik';
import {useId, useLayoutEffect, useRef} from 'react';

import FAQItems from '@/components/forms/FAQItems';
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
  /**
   * Optional FAQ tooltips to provide additional information that is not crucial but may
   * assist users in filling out the field correctly.
   */
  faqItems?: FAQItem[];
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
  faqItems = [],
}) => {
  name = useFieldConfig(name);
  const [, {error = '', touched}] = useField<string>({name, type: 'radio'});
  const id = useId();

  const fieldsetRef = useRef<HTMLDivElement | null>(null);

  // we can't set the aria-readonly prop on the Fieldset component, as it's not forwarded
  // to the underlying fieldset element - see:
  // https://github.com/nl-design-system/utrecht/issues/3006
  useLayoutEffect(() => {
    const fieldsetElement = fieldsetRef.current?.querySelector('fieldset');
    if (!fieldsetElement) return;
    fieldsetElement.ariaReadOnly = isReadOnly ? 'true' : null;
  }, [isReadOnly]);

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <Fieldset
      ref={fieldsetRef}
      className="utrecht-form-fieldset--openforms utrecht-form-fieldset--openforms-radio"
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

      {/* Fieldsets don't support the __description and __error-message elements */}
      <HelpText id={descriptionId}>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}

      <div className="openforms-radio-group">
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
      </div>

      <FAQItems items={faqItems} />
    </Fieldset>
  );
};

RadioField.displayName = 'RadioField';

export default RadioField;
