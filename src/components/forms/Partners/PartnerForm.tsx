import {AnyComponentSchema} from '@open-formulieren/types';
import {ButtonGroup} from '@utrecht/button-group-react';
import {Fieldset} from '@utrecht/component-library-react';
import {Formik} from 'formik';
import {useMemo} from 'react';
import {useIntl} from 'react-intl';
import {toFormikValidationSchema} from 'zod-formik-adapter';

import FormFieldContainer from '@/components/FormFieldContainer';
import {type FormioComponentProps} from '@/components/FormioComponent';
import type {GetRegistryEntry} from '@/registry/types';
import {buildValidationSchema} from '@/validationSchema';

import PartnerSubmitButton from './PartnerSubmitButton';
import PARTNER_COMPONENTS from './definition';
import type {ManuallyAddedPartnerDetails} from './types';

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
          {components.map(definition => (
            <FormioComponent key={definition.id} componentDefinition={definition} />
          ))}
          <ButtonGroup direction="column" className="openforms-form-navigation">
            <PartnerSubmitButton />
          </ButtonGroup>
        </FormFieldContainer>
      </Formik>
    </Fieldset>
  );
};

export default PartnerForm;
