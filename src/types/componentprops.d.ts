import { ComponentSchema } from 'formiojs'
import React from 'react'

interface IComponentProps {
  component: ComponentSchema

  children: React.ReactNode

  errors: string[]
}
