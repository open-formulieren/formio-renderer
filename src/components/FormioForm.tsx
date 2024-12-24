import type {AnyComponentSchema} from '@open-formulieren/types';
import {Form, Formik} from 'formik';

import type {JSONObject} from '@/types';

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
  const initialValues: JSONObject = {};
  console.log(initialValues);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async values => {
        await onSubmit(values);
      }}
    >
      <Form>
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
