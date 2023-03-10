import { Columns, Column, Content, TextField, IColumnProps } from '@components'
import {
  IComponentProps,
  IFormioColumn,
  IFormioComponent,
  IFormioForm,
  IRenderConfiguration
} from '@types'
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

interface IRenderFormProps {
  form: IFormioForm
}

/**
 * Renders a Form.io `form`.
 * @external {RenderContext} Expects `RenderContext` to be available.
 */
export const RenderForm = ({ form }: IRenderFormProps): React.ReactElement => {
  const children =
    form.components?.map((component: IFormioComponent) => (
      <RenderComponent key={component.id} component={component} />
    )) || null
  return <React.Fragment>{children}</React.Fragment>
}

interface IRenderComponentProps {
  component: IFormioComponent
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
  const tree = component.components?.length
    ? component.components
    : component.columns
    ? component.columns.map(
        (c: IFormioColumn): IColumnProps => ({ ...c, children: null, type: 'column' })
      )
    : []

  const children = tree.map((c: IFormioComponent, i: number) => (
    <RenderComponent key={c.id || i} component={c} />
  ))

  return (
    <Component component={component} errors={[]}>
      {children}
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
