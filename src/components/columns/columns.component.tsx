import { IComponentProps } from '@types'
import clsx from 'clsx'
import React from 'react'

/**
 * This component can be used for grouping other components, like Text Field, Text Area, Checkbox
 * etc., into configurable columns. It might be useful if you want to display more than one
 * component in one line.
 */
export const Columns = (componentProps: IComponentProps): React.ReactElement => {
  const { children, ...props } = componentProps
  const className = clsx(`of-${componentProps.component.type}`)

  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}
