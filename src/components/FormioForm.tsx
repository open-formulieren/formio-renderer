import type {AnyComponentSchema} from '@open-formulieren/types';
import {Form, Formik, setIn} from 'formik';

import {getRegistryEntry} from '@/registry';
import type {JSONObject, JSONValue} from '@/types';

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
  const initialValuePairs: [string, JSONValue][] = components
    .map(componentDefinition => {
      const getInitialValues = getRegistryEntry(componentDefinition)?.getInitialValues;
      if (getInitialValues === undefined) return [];
      return getInitialValues(componentDefinition);
    })
    .reduce((acc: [string, JSONValue][], currentValue: [string, JSONValue][]) => {
      acc.push(...currentValue);
      return acc;
    }, []);

  // assign all the default values from the component definitions
  let initialValues: JSONObject = {};
  initialValuePairs.forEach(pair => {
    const [key, value] = pair;
    initialValues = setIn(initialValues, key, value);
  });

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
