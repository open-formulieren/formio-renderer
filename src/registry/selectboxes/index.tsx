import type {SelectboxesComponentSchema} from '@open-formulieren/types';
import {Fieldset, FieldsetLegend} from '@utrecht/component-library-react';
import clsx from 'clsx';
import {useField, useFormikContext} from 'formik';
import {useId} from 'react';

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

  const {getFieldMeta} = useFormikContext();
  const [, {error = ''}] = useField(key);
  const id = useId();

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

  // TODO: support option descriptions
  // TODO: validate the component when no checkbox inside is blurred

  return (
    <Fieldset
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

      {options.map(({value, label: optionLabel}) => (
        <Checkbox key={value} name={`${key}.['${value}']`} label={optionLabel} />
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
