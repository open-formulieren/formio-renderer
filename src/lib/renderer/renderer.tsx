import {
  Button,
  Column,
  Columns,
  Content,
  IColumnComponent,
  IColumnProps,
  IFormioColumn,
  TextField,
} from '@components';
import {DEFAULT_VALIDATORS, getFormErrors} from '@lib/validation';
import {IComponentProps, IFormioForm, IRenderConfiguration, IValues} from '@types';
import {Formik, useField, useFormikContext} from 'formik';
import {FormikHelpers} from 'formik/dist/types';
import {Utils} from 'formiojs';
import {ConditionalOptions} from 'formiojs/types/components/schema';
import React, {FormHTMLAttributes, useContext} from 'react';

export const DEFAULT_RENDER_CONFIGURATION: IRenderConfiguration = {
  components: {
    button: Button,
    columns: Columns,
    column: Column,
    content: Content,
    textfield: TextField,
  },
  validators: DEFAULT_VALIDATORS,
};

/** React context providing the IRenderConfiguration. */
export const RenderContext = React.createContext<IRenderConfiguration>(
  DEFAULT_RENDER_CONFIGURATION
);

/** Form.io does not guarantee a key for a form component, we use this as a fallback. */
export const OF_MISSING_KEY = 'OF_MISSING_KEY';

/**
 * Specifies the required and optional properties for a schema which can be rendered by the
 * renderer.
 *
 * A schema implementing `IRenderable` is not limited to `ComponentSchema` (as columns can be
 * rendered) and components will be rendered with the full (Component)Schema.
 */
export interface IRenderable {
  key: string;
  type: string;

  components?: IRenderable[];
  clearOnHide?: boolean;
  columns?: IRenderable[];
  conditional?: ConditionalOptions;
  hidden?: boolean;
  id?: string;

  [index: string]: any;
}

export interface IRenderFormProps {
  children: React.ReactNode;
  configuration: IRenderConfiguration;
  form: IFormioForm;
  formAttrs: FormHTMLAttributes<HTMLFormElement>;
  initialValues: IValues;
  onSubmit: (values: IValues, formikHelpers: FormikHelpers<IValues>) => void | Promise<any>;
}

/**
 * Renderer for rendering a Form.io configuration passed as form. Iterates over children and returns
 * `React.ReactElement` containing the rendered form.
 *
 * Submit form
 * ---
 *
 * The submit button is not provided by `RenderForm` but can be passed using a child component
 * (tree) which is rendered after the rendered form components.
 *
 *
 * Configuring custom components
 * ---
 *
 * `RenderContext` expects a `IRenderConfiguration` which is expected to be available via
 * `useContext(RenderContext)`. The IRenderConfiguration's `components` entry should contain a
 * mapping between a component type and the (React) component / Function. Overriding RenderContext
 * allows for specifying components.
 *
 * All components receive the `IComponentProps` as props containing the required context to render
 * the component. Components should return a React.ReactElement.
 *
 * @external {RenderContext} Provides `RenderContext`.
 */
export const RenderForm = ({
  children,
  configuration,
  form,
  formAttrs,
  initialValues = {},
  onSubmit,
}: IRenderFormProps): React.ReactElement => {
  const childComponents =
    form.components?.map((c: IRenderable) => (
      <RenderComponent key={`${c.id}-${c.key}`} component={c} form={form} />
    )) || null;

  return (
    <RenderContext.Provider value={configuration}>
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={values => getFormErrors(form, values, configuration.validators)}
      >
        {props => {
          return (
            <form onSubmit={props.handleSubmit} {...formAttrs}>
              {childComponents}
              {children}
            </form>
          );
        }}
      </Formik>
    </RenderContext.Provider>
  );
};

export interface IRenderComponentProps {
  component: IRenderable;
  form: IFormioForm;
}

/**
 * Renderer for rendering a Form.io component passed as component. Iterates over children (and
 * columns) and returns a `React.ReactElement` containing the rendered component.
 *
 * Columns
 * ---
 *
 * In certain cases a component (is not defined as) a component but something else (e.g. a column)
 * We deal with this edge cases by extending the schema with a custom (component) type allowing it
 * to be picked up by `useComponentType` and rendered.
 *
 * This allows for components to remain simple and increases compatibility with existing design
 * systems.
 *
 * Configuring custom components
 * ---
 *
 * `RenderContext` expects a `IRenderConfiguration` which is expected to be available via
 * `useContext(RenderContext)`. The IRenderConfiguration's `components` entry should contain a
 * mapping between a component type and the (React) component / Function. Overriding RenderContext
 * allows for specifying components.
 *
 * @see  {RenderForm} for more information.
 * @external {FormikContext} Expects `Formik`/`FormikContext` to be available.
 * @external {RenderContext} Expects `RenderContext` to be available.
 */
export const RenderComponent = ({
  component,
  form,
}: IRenderComponentProps): React.ReactElement | null => {
  const key = component.key || OF_MISSING_KEY;
  const {setFieldValue, values} = useFormikContext();
  const Component = useComponentType(component);
  const field = useField(key);

  // Basic Form.io conditional.
  const show = Utils.hasCondition(component)
    ? Utils.checkCondition(component, null, values, form, null)
    : !component.hidden;

  if (!show && component.clearOnHide) {
    setFieldValue(key, null);
  }

  if (!show) {
    return null;
  }

  const [{value, onBlur, onChange}, {error}] = field;
  const callbacks = {onBlur, onChange};
  const errors = error?.split('\n') || []; // Reconstruct array.

  // In certain cases a component (is not defined as) a component but something else (e.g. a column)
  // We deal with these edge cases by extending the schema with a custom (component) type allowing
  // it to be picked up by the renderer and passed to the parent
  //
  // This allows for components to remain simple and increases compatibility with existing design
  // systems.
  const cComponents = component.components || null;
  const cColumns = component.columns || null;

  // Regular children, either from component or column.
  const childComponents = cComponents?.map(c => (
    <RenderComponent key={`${c.id}-${c.key}`} component={c} form={form} />
  ));

  // Columns from component.
  const childColumns = cColumns?.map(c => (
    <RenderComponent
      key={`${c.id}-${c.key}`}
      component={{
        ...c,
        key: OF_MISSING_KEY,
        type: 'column',
      }}
      form={form}
    />
  ));

  // Return the component, pass children.
  return (
    <Component callbacks={callbacks} component={component} errors={errors} value={value}>
      {childComponents || childColumns}
    </Component>
  );
};

/**
 * Fallback component, gets used when no other component is found within the `RenderContext`
 * The Fallback component makes sure (child) components keep being rendered with as little side
 * effects as possible.
 */
const Fallback = (props: IComponentProps) => <React.Fragment>{props.children}</React.Fragment>;

/**
 * Custom hook resolving the `React.ComponentType` from `RenderContext`.
 * @external {RenderContext} Expects `RenderContext` to be available.
 */
export const useComponentType = (
  component: IRenderable
): React.ComponentType<IColumnProps | IComponentProps> => {
  const renderConfiguration = useContext(RenderContext);
  const ComponentType = renderConfiguration.components[component.type];
  return ComponentType || Fallback;
};
