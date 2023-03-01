import { Component } from './component'
import { Form } from './form'

export interface TreeConfiguration {
  callbacks: CallbackConfiguration

  formErrors: FormErrors

  form: Form

  renderConfiguration: RenderConfiguration
}

export interface BranchConfiguration {
  components: Component[]

  formErrors: FormErrors

  renderConfiguration: RenderConfiguration

  callbacks: CallbackConfiguration
}

export interface LeafConfiguration {
  callbacks: CallbackConfiguration
  component: Component

  components: Component[]

  formErrors: FormErrors

  renderConfiguration: RenderConfiguration
}

export interface RenderConfiguration {
  components: ComponentConfiguration[]

  renderer: { renderTree: Function; renderBranch: Function; renderLeaf: Function }
}

export interface CallbackConfiguration {
  onChange?: callback

  onBlur?: callback

  onSubmit?: callback

  [index: string]: callback | undefined
}

export type callback = <T>(event: T) => void

export interface ComponentConfiguration {
  type: string

  component: any
}

export interface FormErrors {
  [index: string]: string[]
}

export type ComponentErrors = string[]
