import { IComponentProps } from './componentprops'
import { IColumnProps } from '@components'
import React from 'react'

export interface IRenderConfiguration {
  components: IComponentConfiguration
}

export interface ICallbackConfiguration {
  [index: string]: (e: Event | React.BaseSyntheticEvent) => void
}

export type callback = (e: Event | React.BaseSyntheticEvent) => void

export interface IComponentConfiguration {
  [index: string]: React.ComponentType<IColumnProps | IComponentProps>
}
