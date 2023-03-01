import { Component } from './component'
import { CallbackConfiguration, ComponentErrors, FormErrors, RenderConfiguration } from './config'
import React from 'react'

interface ComponentProps {
  callbacks: CallbackConfiguration

  children: React.ReactNode

  component: Component

  components: Component[]

  formErrors: FormErrors

  errors: ComponentErrors

  renderConfiguration: RenderConfiguration
}
