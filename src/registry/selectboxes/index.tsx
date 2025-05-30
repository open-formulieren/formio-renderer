import type {SelectboxesComponentSchema} from '@open-formulieren/types';
import {Fieldset, FieldsetLegend} from '@utrecht/component-library-react';
import clsx from 'clsx';
import {useField, useFormikContext} from 'formik';
import {useEffect, useId, useRef} from 'react';

import Checkbox from '@/components/forms/Checkbox';
import HelpText from '@/components/forms/HelpText';
import {LabelContent} from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import getInitialValues from './initialValues';
import {assertManualValues} from './types';
import getValidationSchema from './validationSchema';

export interface FormioSelectboxesProps {
  componentDefinition: SelectboxesComponentSchema;
}

export const FormioSelectboxes: React.FC<FormioSelectboxesProps> = ({componentDefinition}) => {
  assertManualValues(componentDefinition);
  const {key, label, tooltip, description, validate = {}, values: options} = componentDefinition;
  const {required = false} = validate;

  const {getFieldMeta, validateField} = useFormikContext();
  const [, {error = ''}] = useField(key);
  const id = useId();

  const fieldsetRef = useRef<HTMLDivElement | null>(null);

  // track the focus state of the fieldset and its children - when it loses focus, trigger
  // validation
  useEffect(() => {
    const container = fieldsetRef.current;
    if (!container) return;

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
      validateField(key);
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
      validateField(key);
    };

    // we subscribe to global events because we need to know whether the focus shifted
    // away from our component
    document.addEventListener('click', handleClick);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [fieldsetRef, validateField, key]);

  // derive the component touched state from the individual checkboxes that make up the
  // component
  const touched = options.some(({value}) => {
    const nestedFieldName = `${key}.['${value}']`;
    const {touched} = getFieldMeta<boolean>(nestedFieldName);
    return touched;
  });

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;
  const descriptionid = `${id}-description`;

  return (
    <Fieldset
      ref={fieldsetRef}
      className="utrecht-form-fieldset--openforms"
      invalid={invalid}
      aria-describedby={description ? descriptionid : undefined}
    >
      <FieldsetLegend
        className={clsx({'utrecht-form-fieldset__legend--openforms-tooltip': !!tooltip})}
      >
        <LabelContent isRequired={required}>{label}</LabelContent>
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </FieldsetLegend>

      {options.map(({value, label: optionLabel, description}) => (
        <Checkbox
          key={value}
          name={`${key}.['${value}']`}
          label={optionLabel}
          description={description}
          descriptionAsHelpText={false}
        />
      ))}

      <HelpText id={descriptionid}>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </Fieldset>
  );
};

const SelectboxesComponent: RegistryEntry<SelectboxesComponentSchema> = {
  formField: FormioSelectboxes,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
};

export default SelectboxesComponent;
