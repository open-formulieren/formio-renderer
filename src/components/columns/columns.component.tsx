import { IComponentProps, IFormioColumn } from '@types'
import clsx from 'clsx'
import React from 'react'

/**
 * This component can be used for grouping other components, like Text Field, Text Area, Checkbox
 * etc., into configurable columns. It might be useful if you want to display more than one
 * component in one line.
 */
export const Columns = (componentProps: IComponentProps): React.ReactElement => {
  const { children } = componentProps
  const className = clsx(`of-${componentProps.component.type}`)

  return <div className={className}>{children}</div>
}

export interface IColumnProps extends IFormioColumn {
  children: React.ReactNode

  type: 'column'
}

/**
 * Not actually a component but an extension of `IFormioColumn` with a fixed type "column" allowing
 * it to be picked up by the renderer. This component is automatically generated for each `columns`
 * entry in a Form.io component.
 */
export const Column = (columnProps: IColumnProps): React.ReactElement => {
  const { children } = columnProps
  const className = clsx(`of-column`)

  return <section className={className}>{children}</section>
}
