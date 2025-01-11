import type {AnyComponentSchema} from '@open-formulieren/types';
import {Form, Formik, setIn} from 'formik';
import {toFormikValidationSchema} from 'zod-formik-adapter';

import {getRegistryEntry} from '@/registry';
import type {JSONObject} from '@/types';
import {buildValidationSchema, extractInitialValues} from '@/utils';

import FormFieldContainer from './FormFieldContainer';
import FormioComponent from './FormioComponent';

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
  children: React.ReactNode;
}

const FormioForm: React.FC<FormioFormProps> = ({components, onSubmit, children}) => {
  // build the initial values from the component definitions
  const initialValuePairs = extractInitialValues(components, getRegistryEntry);
  const zodSchema = buildValidationSchema(components, getRegistryEntry);

  // assign all the default values from the component definitions
  let initialValues: JSONObject = {};
  initialValuePairs.forEach(pair => {
    const [key, value] = pair;
    initialValues = setIn(initialValues, key, value);
  });

  return (
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
  );
};

export default FormioForm;
