import { ISubmission } from '../../types/submission'
import {
  Column,
  Columns,
  Content,
  IColumnComponent,
  IColumnProps,
  IFormioColumn,
  TextField
} from '@components'
import {
  ICallbackConfiguration,
  IComponentProps,
  IFormioForm,
  IRenderConfiguration,
  value
} from '@types'
import { ComponentSchema } from 'formiojs'
import React, { useContext } from 'react'

export const DEFAULT_RENDER_CONFIGURATION: IRenderConfiguration = {
  components: {
    columns: Columns,
    column: Column,
    content: Content,
    textfield: TextField
  }
}

/** React context providing the renderConfiguration. */
export const CallbacksContext = React.createContext<ICallbackConfiguration>({})

/** React context providing the IRenderConfiguration. */
export const RenderContext = React.createContext<IRenderConfiguration>(DEFAULT_RENDER_CONFIGURATION)

/** React context providing the ISubmission. */
export const SubmissionContext = React.createContext<ISubmission>({ data: {}, metadata: {} })

export interface IRendererComponent extends ComponentSchema {
  columns?: IFormioColumn[]
  components?: IRendererComponent[]
  id: string
  key: string
  type: string
}

export interface IRenderFormProps {
  form: IFormioForm
}

/**
 * Renderer for rendering a Form.io configuration passed as form. Iterates over children and returns
 * `React.ReactElement` containing the rendered form.
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
 * @external {CallbacksContext} Expects `CallbackContext` to be available.
 * @external {RenderContext} Expects `RenderContext` to be available.
 * @external {SubmissionContext} Expects `SubmissionContext` to be available.
 */
export const RenderForm = ({ form }: IRenderFormProps): React.ReactElement => {
  const children =
    form.components?.map((component: IRendererComponent, i: number) => (
      <RenderComponent key={component.id || i} component={component} form={form} />
    )) || null
  return <React.Fragment>{children}</React.Fragment>
}

export interface IRenderComponentProps {
  component: IColumnComponent | IRendererComponent
  form: IFormioForm
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
 * @external {CallbacksContext} Expects `CallbackContext` to be available.
 * @external {RenderContext} Expects `RenderContext` to be available.
 * @external {SubmissionContext} Expects `SubmissionContext` to be available.
 */
export const RenderComponent = ({
  component,
  form
}: IRenderComponentProps): React.ReactElement | null => {
  const show = useConditional(component, form)
  const callbacks = useContext(CallbacksContext)
  const value = useValue(component, show)
  const Component = useComponentType(component)

  // Basic Form.io conditional.
  if (!show) {
    return null
  }

  // In certain cases a component (is not defined as) a component but something else (e.g. a column)
  // We deal with these edge cases by extending the schema with a custom (component) type allowing
  // it to be picked up by the renderer and passed to the parent
  //
  // This allows for components to remain simple and increases compatibility with existing design
  // systems.
  const _component = component as IRendererComponent
  const cComponents = component.components ? component.components : null
  const cColumns = _component.columns ? _component.columns : null

  // Regular children, either from component or column.
  const childComponents = cComponents?.map((c: IRendererComponent, i: number) => (
    <RenderComponent key={c.id || i} component={c} form={form} />
  ))

  // Columns from component.
  const childColumns = cColumns?.map((c: IFormioColumn, i) => (
    <RenderComponent
      key={i}
      component={{
        ...c,
        clearOnHide: false,
        conditional: { eq: undefined, show: undefined, when: undefined },
        defaultValue: undefined,
        hidden: false,
        key: undefined,
        type: 'column'
      }}
      form={form}
    />
  ))

  // Return the component, pass children.
  return (
    <Component callbacks={callbacks} component={component} errors={[]} value={value}>
      {childComponents || childColumns}
    </Component>
  )
}

/**
 * Fallback component, gets used when no other component is found within the `RenderContext`
 * The Fallback component makes sure (child) components keep being rendered with as little side
 * effects as possible.
 */
const Fallback = (props: IComponentProps) => <React.Fragment>{props.children}</React.Fragment>

/**
 * Custom hook resolving the `React.ComponentType` from `RenderContext`.
 * @external {RenderContext} Expects `RenderContext` to be available.
 */
export const useComponentType = (
  component: IColumnComponent | IRendererComponent
): React.ComponentType<IColumnProps | IComponentProps> => {
  const renderConfiguration = useContext(RenderContext)
  const ComponentType = renderConfiguration.components[component.type]
  return ComponentType || Fallback
}

/**
 * Evaluates the `component.conditional` (if set) and returns whether the component should be shown.
 * This does not evaluate complex form logic but merely the basic Form.io conditional logic (found
 * in the "Advanced" tab).
 *
 * @external {SubmissionContext} Expects `RenderContext` to be available.
 * @return {boolean} If a conditional passes, the show argument is returned to respect it's
 * configuration. If a conditional does not pass, `!component.hidden` is used as return value.
 */
export const useConditional = (
  component: IColumnComponent | IRendererComponent,
  form: IFormioForm
) => {
  const { eq, show, when } = component?.conditional || {}
  const isConditionalSet = typeof show == 'boolean' && when
  const otherComponent = getComponentByKey(when as string, form)
  const otherValue = useValue(otherComponent) || ''
  const isEqual = eq === otherValue

  if (!isConditionalSet || !otherComponent || !isEqual) {
    return !component.hidden
  }

  return show
}

/**
 * Custom hook resolving `component` value from `ValuesContext`.
 * @param component
 * @param show When set and false, `component` is considered to be hidden. In such case the value is
 *   set to `null` if `component.clearOnHide` is set.
 * @external {SubmissionContext} Expects `RenderContext` to be available.
 */
export const useValue = (
  component: IColumnComponent | IRendererComponent | null,
  show = true
): value | value[] => {
  const values = useContext(SubmissionContext).data

  if (!component?.key) {
    return null
  }

  if (!show && component.clearOnHide) {
    values[component.key] = null
    return null
  }

  return values[component.key] || component.defaultValue || null
}

/**
 * Finds component with `key` in `form` recursively, return null if the component cannot  be found.
 */
export const getComponentByKey = (key: string, form: IFormioForm): IRendererComponent | null => {
  return (
    (form.components
      .reduce((acc, val: IRendererComponent) => {
        const components = val.components || []
        const columns = val.columns || []
        const columnComponents = columns.reduce(
          (acc, val) => [...acc, ...val.components],
          form.components
        )
        return [...acc, ...components, ...columnComponents]
      }, [])
      .find((c) => c.key === key) as IRendererComponent) || null
  )
}
