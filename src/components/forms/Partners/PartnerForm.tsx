import type {AnyComponentSchema} from '@open-formulieren/types';
import {ButtonGroup, Fieldset, PrimaryActionButton} from '@utrecht/component-library-react';
import {Formik, useFormikContext} from 'formik';
import {useMemo} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {toFormikValidationSchema} from 'zod-formik-adapter';

import FormFieldContainer from '@/components/FormFieldContainer';
import {type FormioComponentProps} from '@/components/FormioComponent';
import type {GetRegistryEntry} from '@/registry/types';
import {buildValidationSchema} from '@/validationSchema';

import PARTNER_COMPONENTS from './subFieldDefinitions';
import type {ManuallyAddedPartnerDetails} from './types';

const PartnerSubmitButton: React.FC = () => {
  const {isSubmitting, submitForm} = useFormikContext<ManuallyAddedPartnerDetails>();
  return (
    <PrimaryActionButton
      type="button"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        submitForm();
      }}
      disabled={isSubmitting}
    >
      <FormattedMessage
        description="Partner form submit button: button text"
        defaultMessage="Save"
      />
    </PrimaryActionButton>
  );
};

export interface AddPartnerFormProps {
  partner: ManuallyAddedPartnerDetails;
  onSave: (partner: ManuallyAddedPartnerDetails) => void;
  renderNested: React.FC<FormioComponentProps>;
  getRegistryEntry: GetRegistryEntry;
}

const PartnerForm: React.FC<AddPartnerFormProps> = ({
  partner,
  onSave,
  renderNested: FormioComponent,
  getRegistryEntry,
}) => {
  const intl = useIntl();

  const components: AnyComponentSchema[] = useMemo(
    () =>
      PARTNER_COMPONENTS.map(component => ({
        ...component,
        label: intl.formatMessage(component.label),
      })),
    [intl]
  );
  const zodSchema = buildValidationSchema(components, intl, getRegistryEntry);

  return (
    <Fieldset>
      <Formik<ManuallyAddedPartnerDetails>
        initialValues={partner}
        validateOnChange={false}
        validateOnBlur={false}
        enableReinitialize
        validationSchema={toFormikValidationSchema(zodSchema)}
        onSubmit={onSave}
      >
        <FormFieldContainer>
          {components.map(componentDefinition => (
            <FormioComponent
              key={componentDefinition.id}
              componentDefinition={componentDefinition}
            />
          ))}
          <ButtonGroup>
            <PartnerSubmitButton />
          </ButtonGroup>
        </FormFieldContainer>
      </Formik>
    </Fieldset>
  );
};

export default PartnerForm;
