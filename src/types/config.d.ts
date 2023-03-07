import { IComponentProps } from './componentprops'
import React from 'react'

export interface IRenderConfiguration {
  components: IComponentConfiguration
}

export type callback = <T>(event: T) => void

export interface IComponentConfiguration {
  [index: string]: React.ComponentType<IComponentProps>
}
