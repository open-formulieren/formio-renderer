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
  static renderTree({
    callbacks,
    form,
    formErrors,
    renderConfiguration
  }: TreeConfiguration): React.ReactNode {
    const Form = renderConfiguration.components.find(
      (c) => String(c.type).toLowerCase() === 'form'
    )?.component

    if (!Form) {
      throw new Error('Cant find Form component in renderConfiguration!')
    }

    const children = renderConfiguration.renderer.renderBranch({
      callbacks,
      components: form.components,
      formErrors: formErrors,
      renderConfiguration
    })

    return <Form callbacks={callbacks}>{children}</Form>
  }

  static renderBranch({
    callbacks,
    components,
    formErrors,
    renderConfiguration
  }: BranchConfiguration): React.ReactNode {
    return components.map((component: Component) =>
      renderConfiguration.renderer.renderLeaf({
        callbacks,
        component,
        formErrors,
        renderConfiguration,
        components
      })
    )
  }

  static renderLeaf({
    callbacks,
    component,
    components,
    formErrors,
    renderConfiguration
  }: LeafConfiguration): React.ReactNode {
    const tree = component.components || []
    const children = renderConfiguration.renderer.renderBranch({
      callbacks,
      components: tree,
      formErrors,
      renderConfiguration
    })
    const type = component.type
    const key = component.id

    const componentConfiguration = renderConfiguration.components.find(
      (c: ComponentConfiguration) => c.type === type
    )
    const componentErrorsEntry = Object.entries(formErrors).find(
      ([key]) => String(key) === String(component.key)
    )
    const componentErrors = componentErrorsEntry ? componentErrorsEntry[1] : []

    // Fallback shows name and children of component.
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
        formErrors={formErrors}
        errors={componentErrors}
        renderConfiguration={renderConfiguration}
        callbacks={callbacks}
      >
        {children}
      </Component>
    )
  }
}
