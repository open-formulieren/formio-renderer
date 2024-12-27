import type {AnyComponentSchema} from '@open-formulieren/types';
import {Form, Formik, setIn} from 'formik';
import {toFormikValidationSchema} from 'zod-formik-adapter';

import {extractInitialValues} from '@/initialValues';
import {getRegistryEntry} from '@/registry';
import type {JSONObject} from '@/types';
import {buildValidationSchema} from '@/validationSchema';

import FormFieldContainer from './FormFieldContainer';
import FormioComponent from './FormioComponent';
import RendererSettingsProvider from './RendererSettingsProvider';

/**
 * Props for a complete Formio form definition.
 *
 * A formio form configuration typically also has the keys `display` and possibly
 * `settings` - we don't support those. Only the list of components to render is used.
 */
export interface FormioFormProps {
  /**
   * The form components to render. Only the @open-formulieren/types components are
   * supported.
   */
  components: AnyComponentSchema[];
  // enforce it to be async, makes Formik call setSubmitting when it resolves
  onSubmit: (values: JSONObject) => Promise<void>;
  children?: React.ReactNode;
  /**
   * Mark required fields with an asterisk. If asterisks are not used, then a suffix
   * is added to the label of optional fields to specify the field is not required.
   */
  requiredFieldsWithAsterisk?: boolean;
}

const FormioForm: React.FC<FormioFormProps> = ({
  components,
  onSubmit,
  children,
  requiredFieldsWithAsterisk,
}) => {
  // assign all the default values from the component definitions
  const initialValues = Object.entries(extractInitialValues(components, getRegistryEntry)).reduce(
    (acc: JSONObject, [key, value]) => {
      acc = setIn(acc, key, value);
      return acc;
    },
    {} satisfies JSONObject
  );
  // build the validation schema from the component definitions
  const zodSchema = buildValidationSchema(components, getRegistryEntry);

  return (
    <RendererSettingsProvider requiredFieldsWithAsterisk={requiredFieldsWithAsterisk}>
      <Formik
        initialValues={initialValues}
        validateOnChange={false}
        validateOnBlur
        validationSchema={toFormikValidationSchema(zodSchema)}
        onSubmit={async values => {
          await onSubmit(values);
        }}
      >
        <Form noValidate>
          <FormFieldContainer>
            {/* TODO: pre-process components to ensure they have an ID? */}
            {components.map((definition, index) => (
              <FormioComponent key={`${definition.id || index}`} componentDefinition={definition} />
            ))}
          </FormFieldContainer>
          {children}
        </Form>
      </Formik>
    </RendererSettingsProvider>
  );
};

export default FormioForm;
