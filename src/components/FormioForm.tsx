import type {AnyComponentSchema} from '@open-formulieren/types';
import {Form, Formik, FormikErrors, setNestedObjectValues, useFormikContext} from 'formik';
import {useMemo} from 'react';
import {useIntl} from 'react-intl';
import {toFormikValidationSchema} from 'zod-formik-adapter';

import {getRegistryEntry} from '@/registry';
import type {JSONObject} from '@/types';
import {buildValidationSchema} from '@/validationSchema';
import {deepMergeValues, extractInitialValues} from '@/values';
import {filterVisibleComponents} from '@/visibility';

import FormFieldContainer from './FormFieldContainer';
import FormioComponent from './FormioComponent';
import RendererSettingsProvider from './RendererSettingsProvider';

export type ErrorObject = {[K: string]: string | string[] | ErrorObject};

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
  /**
   * Initial values for the form. This is merged with and overrides default values
   * extracted from the component definitions.
   */
  values?: JSONObject;
  /**
   * Initial validation errors to display. Note that these are cleared when the
   * client side validation runs.
   */
  errors?: ErrorObject;

  /**
   * Callback when the form validates (client-side) to submit the entered values.
   *
   * It receives the entered field values object.
   *
   * Must be an async function to make the Formik state handling a bit more ergonomic.
   */
  onSubmit: (values: JSONObject) => Promise<void>;

  /**
   * HTML ID of the <form> element - required if you put the submit button outside of
   * <form> tag.
   */
  id?: string;

  /**
   * Any children passed to the form will be rendered after the form fields.
   */
  children?: React.ReactNode;
  /**
   * Mark required fields with an asterisk. If asterisks are not used, then a suffix
   * is added to the label of optional fields to specify the field is not required.
   */
  requiredFieldsWithAsterisk?: boolean;
}

const FormioForm: React.FC<FormioFormProps> = ({
  components,
  values = {},
  errors,
  onSubmit,
  id,
  children,
  requiredFieldsWithAsterisk,
}) => {
  const intl = useIntl();

  // use the extracted component default values and merge with 'outside' values to use
  // as initial form state
  const initialValues = extractInitialValues(components, getRegistryEntry);
  values = deepMergeValues(initialValues, values);

  // build the validation schema from the component definitions
  // TODO: take into account hidden components!
  const zodSchema = buildValidationSchema(components, intl, getRegistryEntry);

  return (
    <RendererSettingsProvider requiredFieldsWithAsterisk={requiredFieldsWithAsterisk}>
      <Formik<JSONObject>
        initialValues={values}
        initialErrors={errors as FormikErrors<JSONObject>}
        // figure out initial touched from the provided errors
        initialTouched={errors ? setNestedObjectValues(errors, true) : undefined}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={toFormikValidationSchema(zodSchema)}
        onSubmit={async values => {
          await onSubmit(values);
        }}
      >
        {/* TODO: pre-process components to ensure they have an ID? */}
        <InnerFormioForm id={id} components={components}>
          {children}
        </InnerFormioForm>
      </Formik>
    </RendererSettingsProvider>
  );
};

export type InnerFormioFormProps = Pick<FormioFormProps, 'components' | 'id' | 'children'>;

/**
 * The FormioForm component inner children, with access to the Formik state.
 */
const InnerFormioForm: React.FC<InnerFormioFormProps> = ({components, id, children}) => {
  const {values} = useFormikContext<JSONObject>();

  const componentsToRender: AnyComponentSchema[] = useMemo(() => {
    return filterVisibleComponents(components, values, getRegistryEntry);
  }, [components, values]);

  return (
    <Form noValidate id={id}>
      <FormFieldContainer>
        {componentsToRender.map((definition, index) => (
          <FormioComponent key={`${definition.id || index}`} componentDefinition={definition} />
        ))}
      </FormFieldContainer>
      {children}
    </Form>
  );
};

export default FormioForm;
