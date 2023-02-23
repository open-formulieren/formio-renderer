import { Component } from './component'
import { Form } from './form'

export interface TreeConfiguration {
  form: Form

  renderConfiguration: RenderConfiguration

  callbacks: CallbackConfiguration
}

export interface BranchConfiguration {
  components: Component[]

  renderConfiguration: RenderConfiguration

  callbacks: CallbackConfiguration
}

export interface LeafConfiguration {
  component: Component

  components: Component[]

  renderConfiguration: RenderConfiguration

  callbacks: CallbackConfiguration
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
