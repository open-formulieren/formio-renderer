import { Component } from './component'
import { CallbackConfiguration, RenderConfiguration } from './config'
import React from 'react'

interface ComponentProps {
  component: Component

  children: React.ReactNode

  callbacks: CallbackConfiguration

  renderConfiguration: RenderConfiguration

  components: Component[]
}
