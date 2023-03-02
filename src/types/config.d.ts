import { Component } from './component'
import { FormErrors } from './errors'
import { Form } from './form'
import { I18N } from './i18n'
import React from 'react'

export interface TreeConfiguration {
  callbacks: CallbackConfiguration

  formErrors: FormErrors

  form: Form

  renderConfiguration: RenderConfiguration
}

export interface BranchConfiguration {
  callbacks: CallbackConfiguration

  components: Component[]

  formErrors: FormErrors

  renderConfiguration: RenderConfiguration
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

  i18n?: I18N
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

  component: React.ElementType
}
