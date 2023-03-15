import { IComponentProps } from './componentprops'
import { IColumnProps } from '@components'
import React from 'react'

export interface IRenderConfiguration {
  components: IComponentConfiguration
}

export interface IComponentConfiguration {
  [index: string]: React.ComponentType<IColumnProps | IComponentProps>
}
