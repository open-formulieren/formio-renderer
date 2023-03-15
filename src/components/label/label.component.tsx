import { IComponentProps } from '@types'
import clsx from 'clsx'
import React from 'react'

/**
 * Label component.
 */
export const Label = (componentProps: IComponentProps): React.ReactElement | null => {
  const { component } = componentProps
  const className = clsx()

  return (
    <label className={className} htmlFor={component.key}>
      {component.label}
    </label>
  )
}
