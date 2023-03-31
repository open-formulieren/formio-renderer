import { Component } from '@components'
import { IComponentProps } from '@types'
import clsx from 'clsx'
import { ComponentSchema } from 'formiojs'
import React from 'react'

export interface IColumnsComponent extends ComponentSchema {
  type: 'columns'
}

export interface IColumnsProps extends IComponentProps {
  component: IColumnsComponent
}

/**
 * This component can be used for grouping other components, like Text Field, Text Area, Checkbox
 * etc., into configurable columns. It might be useful if you want to display more than one
 * component in one line.
 */
export const Columns = (componentProps: IColumnsProps): React.ReactElement => {
  const { children } = componentProps
  const className = clsx(`of-${componentProps.component.type}`)

  return (
    <Component {...componentProps}>
      <div className={className}>{children}</div>
    </Component>
  )
}

type ColumnSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export interface IFormioColumn {
  components: ComponentSchema[]
  size: ColumnSize
  sizeMobile?: ColumnSize
}

export interface IColumnComponent extends IFormioColumn {
  clearOnHide: false
  defaultValue: undefined
  hidden: false
  key: undefined
  type: 'column'
  conditional: {
    eq: undefined
    show: undefined
    when: undefined
  }
}

export interface IColumnProps extends IComponentProps {
  component: IColumnComponent
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
