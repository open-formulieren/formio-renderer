import type {AnyComponentSchema} from '@open-formulieren/types';
import {
  Form,
  Formik,
  FormikErrors,
  getIn,
  setIn,
  setNestedObjectValues,
  useFormikContext,
} from 'formik';
import {forwardRef, useImperativeHandle, useMemo} from 'react';
import {useIntl} from 'react-intl';
import {toFormikValidationSchema} from 'zod-formik-adapter';

import {getRegistryEntry} from '@/registry';
import type {JSONObject, JSONValue} from '@/types';
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

export interface FormStateRef {
  updateValues: (values: JSONObject) => void;
}

const FormioForm = forwardRef<FormStateRef, FormioFormProps>(
  ({components, values = {}, errors, onSubmit, id, children, requiredFieldsWithAsterisk}, ref) => {
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
          <InnerFormioForm id={id} components={components} ref={ref}>
            {children}
          </InnerFormioForm>
        </Formik>
      </RendererSettingsProvider>
    );
  }
);

export type InnerFormioFormProps = Pick<FormioFormProps, 'components' | 'id' | 'children'>;

/**
 * The FormioForm component inner children, with access to the Formik state.
 */
const InnerFormioForm = forwardRef<FormStateRef, InnerFormioFormProps>(
  ({components, id, children}, ref) => {
    const {values, setValues} = useFormikContext<JSONObject>();

    useImperativeHandle(
      ref,
      () => ({
        updateValues: (values: JSONObject): void => {
          setValues(prev => getFormikValues(prev, values));
        },
      }),
      [setValues]
    );

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
  }
);

/**
 * Deep merge the updates into the prev values.
 *
 * Under the hood, this is passed to Formik's setValues, so we use Formik's `setIn` to avoid
 * (shallow) copies if state has not been changed/affected while recursively applying updates,
 * as the values are passed to dependency arrays and their JS identity is relevant.
 *
 * `prev` and `updates` can both be arbitrary deeply nested.
 */
const getFormikValues = (
  prev: JSONObject,
  updates: Record<string, JSONValue | undefined>
): JSONObject => {
  return merge(prev, updates);
};

const merge = (target: JSONObject, source: Record<string, JSONValue | undefined>): JSONObject => {
  // loop over the keys that are defined, this way we detect explicit `undefined` keys
  // rather than the ones that are absent or explicitly set.
  for (const key in source) {
    const value = source[key];

    // if the values is explicitly set to undefined, it means the key must be removed.
    if (value === undefined) {
      target = setIn(target, key, undefined);
      continue;
    }

    // recurse
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      let targetValue: JSONObject | undefined = getIn(target, key);
      if (targetValue === undefined) {
        targetValue = {};
        target = setIn(target, key, targetValue);
      }
      const nested = merge(targetValue, value);
      target = setIn(target, key, nested);
      continue;
    }

    if (value && Array.isArray(value)) {
      // Arrays are used in:
      // * editgrid components
      // * file upload components
      // * components that have `multiple: true`
      //
      // Because JSON doesn't have the `undefined` concept to potentially remove array
      // items, we treat an array value as a "replace" action and don't recurse for
      // partial updates. If partial updates are required, you should emit
      // `parent.$index.nested` keys in the `source` object.
      target = setIn(target, key, value);
      continue;
    }

    // otherwise we have a primitive, so just assign it
    target = setIn(target, key, value);
  }

  return target;
};

export default FormioForm;
