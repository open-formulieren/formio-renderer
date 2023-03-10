import {
  Columns,
  Column,
  Content,
  TextField,
  IColumnProps,
  IFormioColumn,
  IColumnComponent
} from '@components'
import { IComponentProps, IFormioForm, IRenderConfiguration } from '@types'
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

/**
 * React context providing the renderConfiguration.
 */
export const RenderContext = React.createContext(DEFAULT_RENDER_CONFIGURATION)

interface IRendererComponent extends ComponentSchema {
  columns: IFormioColumn[]
  components: IRendererComponent[]
  id: string
  type: string
}

interface IRenderFormProps {
  form: IFormioForm
}

/**
 * Renders a Form.io `form`.
 * @external {RenderContext} Expects `RenderContext` to be available.
 */
export const RenderForm = ({ form }: IRenderFormProps): React.ReactElement => {
  const children =
    form.components?.map((component: IRendererComponent) => (
      <RenderComponent key={component.id} component={component} />
    )) || null
  return <React.Fragment>{children}</React.Fragment>
}

interface IRenderComponentProps {
  component: IColumnComponent | IRendererComponent
}

/**
 * Renders a Form.io `component` or colum.
 * @external {RenderContext} Expects `RenderContext` to be available.
 */
export const RenderComponent = ({ component }: IRenderComponentProps): React.ReactElement => {
  const Component = useComponentType(component.type)

  // In certain cases a component (is not defined as) a component but something else (e.g. a column)
  // We deal with this edge cases by extending the schema with a custom (component) type allowing it
  // to be picked up by the renderer and passed to the parent
  //
  // This allows for components to remain simple and increases compatibility with existing design
  // systems.
  const _component = component as IRendererComponent
  const cComponents = component.components ? component.components : null
  const cColumns = _component.columns ? _component.columns : null

  // Regular children, either from component or column.
  const childComponents = cComponents?.map((c: IRendererComponent, i: number) => (
    <RenderComponent key={c.id || i} component={c} />
  ))

  // Columns from component.
  const childColumns = cColumns?.map((c: IFormioColumn, i) => (
    <RenderComponent key={i} component={{ ...c, type: 'column' }} />
  ))

  return (
    <Component component={component} errors={[]}>
      {childComponents || childColumns}
    </Component>
  )
}

/**
 * Custom hook resolving the `React.ComponentType` from `RenderContext`.
 * @external {RenderContext} Expects `RenderContext` to be available.
 */
export const useComponentType = (
  type: string
): React.ComponentType<IColumnProps | IComponentProps> => {
  const renderConfiguration = useContext(RenderContext)
  const ComponentType = renderConfiguration.components[type]
  const Fallback = (props: IComponentProps) => <React.Fragment>{props.children}</React.Fragment>

  return ComponentType || Fallback
}
