import type {ChildrenComponentSchema} from '@open-formulieren/types';
import type {FormikErrors} from 'formik';
import {FieldArray, useFormikContext} from 'formik';
import {useId, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {SecondaryActionButton} from '@/components/Button';
import Fieldset from '@/components/forms/Fieldset';
import HelpText from '@/components/forms/HelpText';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';
import {useFieldConfig} from '@/hooks';
import type {RegistryEntry} from '@/registry/types';

import ChildModal from './ChildModal';
import './Children.scss';
import ChildrenTable from './ChildrenTable';
import ValueDisplay from './ValueDisplay';
import {EMPTY_CHILD} from './constants';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import type {ExtendedChildDetails} from './types';
import getValidationSchema from './validationSchema';

export interface FormioChildrenFieldProps {
  componentDefinition: ChildrenComponentSchema;
}

export const FormioChildrenField: React.FC<FormioChildrenFieldProps> = ({
  componentDefinition: {key, label, description, tooltip, enableSelection},
}) => {
  const id = useId();
  key = useFieldConfig(key);
  const {getFieldProps, getFieldMeta, setFieldTouched} = useFormikContext();
  const {touched, error: formikError} = getFieldMeta<ExtendedChildDetails[]>(key);
  const {value: children = []} = getFieldProps<ExtendedChildDetails[]>(key);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const error = formikError as unknown as
    | undefined
    | string
    | (string | FormikErrors<ExtendedChildDetails>)[];

  // check if there's an error for the field *itself*
  const fieldError = typeof error === 'string' && error;

  const invalid = touched && !!fieldError;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;

  const serverFetchedChildren = children.filter(child => !('__addedManually' in child));
  // If there are no server-fetched children, we can add children manually.
  const canAddChildrenManually = serverFetchedChildren.length === 0;

  const closeModal = () => setIsModalOpen(false);

  const markFieldAsTouched = () => {
    setFieldTouched(key, true);
  };

  return (
    <Fieldset
      header={
        <>
          {label}
          {tooltip && <Tooltip>{tooltip}</Tooltip>}
        </>
      }
      isInvalid={invalid}
      hasTooltip={!!tooltip}
      aria-describedby={[descriptionId, errorMessageId].filter(Boolean).join(' ') || undefined}
      className="openforms-children"
    >
      <FieldArray name={key} validateOnChange={false}>
        {arrayHelpers => (
          <>
            {children.length > 0 && (
              <ChildrenTable
                name={key}
                values={children}
                enableSelection={enableSelection}
                onSelectionBlur={() => markFieldAsTouched()}
                updateChild={(childIndex, child) => {
                  arrayHelpers.replace(childIndex, child);
                  markFieldAsTouched();
                }}
                removeChild={childIndex => {
                  arrayHelpers.remove(childIndex);
                  markFieldAsTouched();
                }}
              />
            )}
            {canAddChildrenManually && isModalOpen && (
              <ChildModal
                isOpen={isModalOpen}
                closeModal={closeModal}
                data={EMPTY_CHILD}
                onSubmit={newChild => {
                  arrayHelpers.push({
                    ...newChild,
                    __id: crypto.randomUUID(),
                    selected: enableSelection ? false : undefined,
                  });

                  markFieldAsTouched();
                  closeModal();
                }}
              />
            )}
          </>
        )}
      </FieldArray>

      <HelpText id={descriptionId}>{description}</HelpText>
      {invalid && errorMessageId && <ValidationErrors error={fieldError} id={errorMessageId} />}

      {canAddChildrenManually && (
        <SecondaryActionButton type="button" onClick={() => setIsModalOpen(true)}>
          <FormattedMessage
            description="Children component modal: add child button label"
            defaultMessage="Add child"
          />
        </SecondaryActionButton>
      )}
    </Fieldset>
  );
};

const ChildrenFieldComponent: RegistryEntry<ChildrenComponentSchema> = {
  formField: FormioChildrenField,
  valueDisplay: ValueDisplay,
  getValidationSchema,
  getInitialValues,
  isEmpty,
};

export default ChildrenFieldComponent;
