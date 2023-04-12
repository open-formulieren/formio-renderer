import {
  Column,
  Columns,
  Content,
  IColumnComponent,
  IColumnProps,
  IFormioColumn,
  TextField,
} from '@components';
import {DEFAULT_VALIDATORS, validateForm} from '@lib/validation';
import {IComponentProps, IFormioForm, IRenderConfiguration, IValues} from '@types';
import {Formik, useField} from 'formik';
import {FormikHelpers} from 'formik/dist/types';
import {ComponentSchema} from 'formiojs';
import React, {FormHTMLAttributes, useContext} from 'react';

export const DEFAULT_RENDER_CONFIGURATION: IRenderConfiguration = {
  components: {
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
    form.components?.map((component: IRendererComponent, i: number) => (
      <RenderComponent key={component.id || i} component={component} />
    )) || null;

  return (
    <RenderContext.Provider value={configuration}>
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={async values => {
          // TODO: Implement translations.
          // TODO: Implement "threshold" for errors to figure if/what error(s) should be shown.
          const result = await validateForm(form, values, configuration?.validators);

          // Convert the validation errors to messages.
          const entries = Object.entries(result).map(([key, validationErrors]) => {
            const messages = validationErrors
              .map(validationError => validationError.message.trim())
              .join('\n');
            return [key, messages];
          });
          return Object.fromEntries(entries);
        }}
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

export interface IRendererComponent extends ComponentSchema {
  columns?: IFormioColumn[];
  components?: IRendererComponent[];
  id?: string;
  type: string;
}

export interface IRenderComponentProps {
  component: IColumnComponent | IRendererComponent;
}

/** @const Form.io does not guarantee a key for a form component, we use this as a fallback. */
export const OF_MISSING_KEY = 'OF_MISSING_KEY';

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
export const RenderComponent = ({component}: IRenderComponentProps): React.ReactElement => {
  const Component = useComponentType(component);
  const field = useField(component.key || OF_MISSING_KEY);
  const {value, onBlur, onChange} = field[0];
  const callbacks = {onBlur, onChange};
  const errors = field[1].error?.split('\n') || []; // Reconstruct array.

  // In certain cases a component (is not defined as) a component but something else (e.g. a column)
  // We deal with these edge cases by extending the schema with a custom (component) type allowing
  // it to be picked up by the renderer and passed to the parent
  //
  // This allows for components to remain simple and increases compatibility with existing design
  // systems.
  const _component = component as IRendererComponent;
  const cComponents = component.components ? component.components : null;
  const cColumns = _component.columns ? _component.columns : null;

  // Regular children, either from component or column.
  const childComponents = cComponents?.map((c: IRendererComponent, i: number) => (
    <RenderComponent key={c.id || i} component={c} />
  ));

  // Columns from component.
  const childColumns = cColumns?.map((c: IFormioColumn, i) => (
    <RenderComponent
      key={i}
      component={{...c, defaultValue: undefined, key: undefined, type: 'column'}}
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
  component: IColumnComponent | IRendererComponent
): React.ComponentType<IColumnProps | IComponentProps> => {
  const renderConfiguration = useContext(RenderContext);
  const ComponentType = renderConfiguration.components[component.type];
  return ComponentType || Fallback;
};
