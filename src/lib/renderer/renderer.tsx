import { Renderer } from './abstract'
import { Columns, Content, Form, TextField } from '@components'
import {
  Component,
  ComponentConfiguration,
  BranchConfiguration,
  LeafConfiguration,
  TreeConfiguration,
  RenderConfiguration
} from '@types'
import React from 'react'

/**
 * Renderer for rendering a Form.io configuration.
 *
 * NOTE: Function `renderForm(treeConfiguration: TreeConfiguration)` is exported as alias in the
 * root of this project.
 *
 * Introduction
 * ---
 *
 * The renderer implements these static methods:
 *
 * `static renderTree(treeConfiguration: TreeConfiguration): React.ReactNode`,
 * `static renderBranch(branchConfiguration: BranchConfiguration: React.ReactNode)`
 * `static renderLeaf(leafConfiguration: LeafConfiguration): React.ReactNode`
 *
 * Each of these methods take their configuration argument and return a React.ReactNode (something
 * that can be rendered by React). `renderTree(treeConfiguration)` calls
 * `renderBranch(branchConfiguration)` which then calls `renderLeaf(leafConfiguration)`. For child
 * components the `renderLeaf(leafConfiguration)` method calls `renderBranch(branchConfiguration)`
 * which result is passed as (React) children to the component[1].
 *
 *
 * Obtaining values<a name="obtaining-values">
 * ---
 *
 * Each of the render methods take a `callbacks: CallbackConfiguration` object mapping (React) event
 * names (e.g. onChange) to a `Function`. All entries within this object are passed to the
 * component as props allowing for event handlers to be injected (for instance: to trigger state
 * changes). This is the preferred way of extracting data from the form (components).
 *
 *
 * Validation
 * ---
 *
 * The renderer does not validate values but merely shows them. Each of the render methods take a
 * `formErrors: FormError[]` entry containing an object array containing a mapping between the key
 * of a component and it's error messages as a string array. This string array is upon render passed
 * to the component using the `errors: string[]` prop.
 *
 * This library exposes various validators (combined) which can be used to validate obtained values.
 *
 * - See: [`src/lib/validation/validation.ts`](http://localhost:6006/?path=/docs/libraries-validation-validate--page)
 *   for provided validators.
 * - See: [obtaining-values](#obtaining-values) section for how to obtain values to validate.
 *
 *
 * Configuring components
 * ---
 *
 * Components can be specified as array of `ComponentConfiguration` objects as value for the
 * `components` entry within the `renderConfiguration` entry within the configuration argument
 * passed to each of the static methods described above:
 *
 * `TreeConfiguration|BranchConfiguration|LeafConfiguration` ->
 * `renderConfiguration: RenderConfiguration` -> `components: ComponentConfiguration[]`
 *
 * A `ComponentConfiguration` requires a `type: string` entry to be set containing the Form.io
 * component type, this is used to identify the component. The `component: React.ElementType` is
 * then used to render the specific component. Various props like the component, it's errors (but
 * also the renderConfiguration) will be passed to the component allowing it render the
 * `React.ReactNode`.
 *
 * TODO: Context mapping?
 *
 * Footnotes
 * ---
 *
 * [1] - Components may choose (e.g. `Columns`) to ignore `children: React.ReactNode` and call the
 *       renderer (through `renderConfiguration: RenderConfiguration`) to render child components
 *       instead.
 */
export class BaseRenderer implements Renderer {
  /**
   * Renders the tree (form).
   * @param callbacks
   * @param form
   * @param formErrors
   * @param renderConfiguration
   */
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

  /**
   * Renders an array of (child) components.
   * @param callbacks
   * @param components
   * @param formErrors
   * @param renderConfiguration
   */
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

  /**
   * Renders an individual component with its children.
   * @param callbacks
   * @param component
   * @param components
   * @param formErrors
   * @param renderConfiguration
   */
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
    const Component = (componentConfiguration?.component || Fallback) as React.ElementType

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

export const BASE_RENDER_CONFIGURATION: RenderConfiguration = {
  components: [
    {
      component: Form as React.ElementType,
      type: 'form'
    },
    {
      component: Columns,
      type: 'columns'
    },
    {
      component: Content,
      type: 'content'
    },
    {
      component: TextField,
      type: 'textfield'
    }
  ],
  renderer: BaseRenderer
}
