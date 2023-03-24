import { IComponentProps } from './componentprops'
import { IColumnProps } from '@components'
import { validator } from '@lib/validation'
import React from 'react'

export interface IRenderConfiguration {
  components: IComponentConfiguration
  validators: validator[]
}

/**
 * Callback configuration is explicitly marked as optional in order to deal with different schemas
 * as third-party systems might need different callbacks.
 */
export interface ICallbackConfiguration {
  onBlur?: callback | undefined
  onChange?: callback | undefined
  onSubmit?: callback | undefined
  [index: string]: callback | undefined
}

export type callback = (e: Event | React.BaseSyntheticEvent) => void

export interface IComponentConfiguration {
  [index: string]: React.ComponentType<IColumnProps | IComponentProps>
}
