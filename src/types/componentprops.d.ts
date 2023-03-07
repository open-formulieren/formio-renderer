import { IFormioComponent } from './component'
import React from 'react'

interface IComponentProps {
  component: IFormioComponent

  children: React.ReactNode

  [index: string]: any
}
