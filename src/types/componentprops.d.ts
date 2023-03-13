import { ICallbackConfiguration } from './config'
import { value, values } from './values'
import { ComponentSchema } from 'formiojs'
import React from 'react'

interface IComponentProps {
  callbacks: ICallbackConfiguration

  children?: React.ReactNode

  component: ComponentSchema

  errors: string[]

  value: value | values | undefined
}
