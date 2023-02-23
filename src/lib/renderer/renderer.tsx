import { Renderer } from './abstract'
import {
  Component,
  ComponentConfiguration,
  BranchConfiguration,
  LeafConfiguration,
  TreeConfiguration
} from '@types'
import React from 'react'

export class BaseRenderer implements Renderer {
  static renderTree({ form, renderConfiguration, callbacks }: TreeConfiguration): React.ReactNode {
    const Form = renderConfiguration.components.find(
      (c) => String(c.type).toLowerCase() === 'form'
    )?.component

    if (!Form) {
      throw new Error('Cant find Form component in renderConfiguration!')
    }

    const children = renderConfiguration.renderer.renderBranch({
      components: form.components,
      renderConfiguration,
      callbacks
    })

    return <Form callbacks={callbacks}>{children}</Form>
  }

  static renderBranch({
    components,
    renderConfiguration,
    callbacks
  }: BranchConfiguration): React.ReactNode {
    return components.map((component: Component) =>
      renderConfiguration.renderer.renderLeaf({
        component,
        renderConfiguration,
        components,
        callbacks
      })
    )
  }

  static renderLeaf({
    component,
    components,
    renderConfiguration,
    callbacks
  }: LeafConfiguration): React.ReactNode {
    const tree = component.components || []
    const children = renderConfiguration.renderer.renderBranch({
      components: tree,
      renderConfiguration,
      callbacks
    })
    const type = component.type
    const key = component.id

    const componentConfiguration = renderConfiguration.components.find(
      (c: ComponentConfiguration) => c.type === type
    )
    const Fallback = ({ children }: { children: React.ReactNode }) => (
      <div>
        {type}
        {children}
      </div>
    )
    const Component = componentConfiguration?.component || Fallback

    return (
      <Component
        key={key}
        component={component}
        components={components}
        renderConfiguration={renderConfiguration}
        callbacks={callbacks}
      >
        {children}
      </Component>
    )
  }
}
