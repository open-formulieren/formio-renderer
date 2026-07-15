import type {SelectboxesComponentSchema} from '@open-formulieren/types';
import {Fieldset, FieldsetLegend} from '@utrecht/fieldset-react';
import {clsx} from 'clsx';
import {useField, useFormikContext} from 'formik';
import {useEffect, useId, useMemo, useRef} from 'react';

import Checkbox from '@/components/forms/Checkbox';
import FAQItems from '@/components/forms/FAQItems';
import HelpText from '@/components/forms/HelpText';
import {LabelContent} from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';
import type {GetRegistryEntry, RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import testConditional from './conditional';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioSelectboxesProps {
  componentDefinition: SelectboxesComponentSchema;
  getRegistryEntry: GetRegistryEntry;
}

export const FormioSelectboxes: React.FC<FormioSelectboxesProps> = ({
  componentDefinition,
  getRegistryEntry,
}) => {
  const {
    key,
    label,
    tooltip,
    description,
    validate = {},
    values: options,
    faqItems = [],
  } = componentDefinition;
  const {required = false, maxSelectedCount} = validate;
  const {getFieldProps, getFieldMeta, validateField} = useFormikContext();
  const [{value: selectboxesState = {}}, {error = ''}, {setValue}] = useField<
    Record<string, boolean> | undefined
  >(key);
  const id = useId();

  const initialValues: Record<string, boolean> = useMemo(
    () => getInitialValues(componentDefinition, getRegistryEntry)[componentDefinition.key],
    [getRegistryEntry, componentDefinition]
  );

  const fieldsetRef = useRef<HTMLDivElement | null>(null);
  const lastValidatedValueRef = useRef<Record<string, boolean> | null>(null);

  // derive the component touched state from the individual checkboxes that make up the
  // component
  const touched = options.some(({value}) => {
    const nestedFieldName = `${key}.['${value}']`;
    const {touched} = getFieldMeta<boolean>(nestedFieldName);
    return touched;
  });

  // 🩹 - options can be changed dynamically and we need to ensure when they change,
  // that new options are properly injected into the Formik state, otherwise we lose the
  // boolean nature of the value and browser defaults (``[on]``) are used.
  // See open-formulieren/open-forms#6420
  useEffect(() => {
    const updatedValue: Record<string, boolean> = selectboxesState;
    const optionKeysPresentInValue = new Set(Object.keys(updatedValue));
    let hasUpdates = false;

    // check which options aren't in the state yet and add them with their initial value
    // if necessary
    for (const {value} of options) {
      if (optionKeysPresentInValue.has(value)) {
        optionKeysPresentInValue.delete(value);
      } else {
        updatedValue[value] = initialValues[value];
        hasUpdates = true;
      }
    }

    // remove stale values from options that are obsoleted
    if (!hasUpdates && optionKeysPresentInValue.size > 0) hasUpdates = true;
    for (const staleValue of optionKeysPresentInValue) {
      delete updatedValue[staleValue];
    }

    if (hasUpdates) {
      setValue(updatedValue);
    }
  }, [setValue, options, selectboxesState, initialValues]);

  // track the focus state of the fieldset and its children - when it loses focus, trigger
  // validation
  useEffect(() => {
    const container = fieldsetRef.current;
    if (!container) return;

    const {value} = getFieldProps(key);

    // Run validation only if the value has changed since the last validate call.
    const maybeRunValidation = () => {
      const hasChanged = value !== lastValidatedValueRef.current;
      if (!hasChanged) return;
      // moving on to other components without even touching this field should not
      // trigger validation - other components only activate `onBlur` too, which implies
      // 'touched'
      if (!touched) return;

      validateField(key);
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

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [getFieldProps, validateField, key, touched, maxSelectedCount]);

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;
  const descriptionid = `${id}-description`;

  // update the UI by disabling the additional checkboxes once the limit is reached.
  // Extract the option keys/values of only the selected checkboxes.
  const selectedValues = Object.entries(selectboxesState)
    .filter(([, selected]) => selected)
    .map(([value]) => value);
  const limitReached =
    maxSelectedCount === undefined ? false : selectedValues.length >= maxSelectedCount;

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
        <LabelContent isRequired={required} noLabelTag>
          {label}
        </LabelContent>
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </FieldsetLegend>

      {options.map(({value, label: optionLabel, description}) => (
        <Checkbox
          key={value}
          name={`${key}.['${value}']`}
          label={optionLabel}
          description={description}
          descriptionAsHelpText={false}
          ignoreRequired
          isReadOnly={limitReached && !selectedValues.includes(value)}
        />
      ))}

      <HelpText id={descriptionid}>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
      <FAQItems items={faqItems} />
    </Fieldset>
  );
};

const SelectboxesComponent: RegistryEntry<SelectboxesComponentSchema> = {
  formField: FormioSelectboxes,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  testConditional,
  isEmpty,
};

export default SelectboxesComponent;
