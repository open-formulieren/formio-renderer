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

  const onSubmit = async (values: ManuallyAddedPartnerDetails) => {
    console.log('onSubmit', {values});
    onSave(values);
  };

  // @TODO check default Formik values.
  // These undefined and false defintions might not be needed.
  return (
    <Fieldset>
      <Formik<ManuallyAddedPartnerDetails>
        initialValues={partner}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={toFormikValidationSchema(zodSchema)}
        onSubmit={onSubmit}
      >
        <FormFieldContainer>
          {components.map((definition, index) => (
            <FormioComponent key={`${definition.id || index}`} componentDefinition={definition} />
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
