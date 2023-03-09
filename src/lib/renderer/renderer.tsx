import { Columns, Content, TextField } from '@components'
import { IComponentProps, IFormioComponent, IFormioForm, IRenderConfiguration } from '@types'
import React, { useContext } from 'react'

export const DEFAULT_RENDER_CONFIGURATION: IRenderConfiguration = {
  components: {
    columns: Columns,
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
  const Form = useComponentType('form')

  const children =
    form.components?.map((component: IFormioComponent) => (
      <RenderComponent key={component.id} component={component} />
    )) || null

  return <Form component={{ type: 'form', ...form }}>{children}</Form>
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
  // TODO: Rows? Editgrid?
  const tree = component.components || component.columns || []
  const children = tree.map((c: IFormioComponent, i: number) => (
    <RenderComponent key={c.id || i} component={c} />
  ))

  return <Component component={component}>{children}</Component>
}

/**
 * Custom hook resolving the `React.ComponentType` from `RenderContext`.
 * @external {RenderContext} Expects `RenderContext` to be available.
 */
export const useComponentType = (type: string): React.ComponentType<IComponentProps> => {
  const renderConfiguration = useContext(RenderContext)
  const ComponentType = renderConfiguration.components[type]
  const Fallback = (props: IComponentProps) => <React.Fragment>{props.children}</React.Fragment>

  return ComponentType || Fallback
}
