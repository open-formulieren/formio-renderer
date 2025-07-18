import type {AnyComponentSchema} from '@open-formulieren/types';
import {Form, Formik, FormikErrors, setNestedObjectValues, useFormikContext} from 'formik';
import {forwardRef, useEffect, useImperativeHandle, useMemo} from 'react';
import {useIntl} from 'react-intl';
import {toFormikValidationSchema} from 'zod-formik-adapter';

import {hasAnyConditionalLogicCycle} from '@/formio';
import {getRegistryEntry} from '@/registry';
import type {JSONObject, JSONValue} from '@/types';
import {buildValidationSchema} from '@/validationSchema';
import {deepMergeValues, extractInitialValues} from '@/values';
import {processVisibility} from '@/visibility';

import FormFieldContainer from './FormFieldContainer';
import FormioComponent from './FormioComponent';
import RendererSettingsProvider from './RendererSettingsProvider';
import {
  type JSONObjectWithUndefined,
  type JSONValuePlusUndefined,
  type NestedObject,
  merge,
} from './utils';

export type Errors = NestedObject<string | string[]>;

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
  errors?: Errors;

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

export type UpdateValues = JSONObjectWithUndefined;
export type UpdateErrors = NestedObject<string | string[] | undefined>;

export interface FormStateRef {
  updateValues: (values: UpdateValues) => void;
  updateErrors: (errors: UpdateErrors) => void;
}

/**
 * Main component to render a Formio form definition.
 *
 * The form configration (list of components) is processed and default values are
 * extracted, which are merged with any provided existing submission values. The
 * requested form fields are rendered so the user can interact with them.
 *
 * You can pass a `ref` to get an imperative handle to set values and (validation)
 * errors from your parent component.
 *
 * @throws {Error} Throws an error when conditional logic cycles have been detected.
 * It's recommended to validate these in your downstream project and set up an error
 * boundary around the `FormioForm` component.
 */
const FormioForm = forwardRef<FormStateRef, FormioFormProps>(
  ({components, values = {}, errors, onSubmit, id, children, requiredFieldsWithAsterisk}, ref) => {
    const intl = useIntl();

    const isConditionalLogicInvalid = useMemo(
      () => hasAnyConditionalLogicCycle(components),
      [components]
    );
    if (isConditionalLogicInvalid) {
      throw new Error(
        'Detected a conditional logic cycle in the provided components! This ' +
          'can lead to infinite rendering loops and must not happen.'
      );
    }

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
    const {values, setValues, errors, setErrors, setTouched, initialValues} =
      useFormikContext<JSONObject>();

    useImperativeHandle(
      ref,
      () => ({
        updateValues: (values: UpdateValues): void => {
          setValues(prev => getFormikValues(prev, values));
        },
        updateErrors: (updates: UpdateErrors): void => {
          // FormikErrors<JSONObject> narrows down to {[k: string]: string | undefined},
          // which is wrong and misses the recursion entirely. So, we cast instead :(
          const newErrors = getFormikErrors(
            errors as FormikErrors<unknown>,
            updates
          ) as FormikErrors<unknown>;
          setErrors(newErrors);
          setTouched(setNestedObjectValues(newErrors, true));
        },
      }),
      [setValues, errors, setErrors]
    );

    // Compute the visible components and associated updated values (via clearOnHide)
    // every time either the form configuration (components) is modified or when the form
    // values change. Note that the form values also change as a reaction to processed
    // values via clearOnHide, and this implies multiple (render) passes to converge.
    // XXX: this means that component definitions may not have reference cycles in their
    // conditional logic to prevent infinite render loops!
    const {visibleComponents: componentsToRender, updatedValues} = useMemo(() => {
      const {visibleComponents, updatedValues} = processVisibility(components, values, {
        parentHidden: false,
        initialValues,
        getRegistryEntry,
      });
      return {visibleComponents, updatedValues};
    }, [components, initialValues, values]);

    // handle the side-effects from the visibility checks that apply clearOnHide to the
    // values. We can't call setValues directly, since updating state during render like
    // this is not allowed, so we need a synchronization step.
    useEffect(() => {
      // update the formik values with the calculated values with side-effects applied
      // until this converges/resolves. We rely on the object identity here to detect
      // (deep) differences!
      if (updatedValues !== values) {
        setValues(updatedValues);
      }
    }, [setValues, values, updatedValues]);

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
const getFormikValues = (prev: JSONObject, updates: UpdateValues): JSONObject => {
  // the merge function strips out the undefined values by removing the keys from the
  // object.
  return merge<JSONValuePlusUndefined, JSONValue>(prev, updates);
};

const getFormikErrors = (prev: Errors, updates: UpdateErrors): Errors => {
  return merge<string | string[]>(prev, updates);
};

export default FormioForm;
