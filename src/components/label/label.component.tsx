import { IComponentProps } from '@types'
import clsx from 'clsx'
import React from 'react'

/**
 * Label component.
 */
export const Label = (componentProps: IComponentProps): React.ReactElement | null => {
  const { component, htmlFor } = componentProps
  const className = clsx()

  return (
    <label className={className} htmlFor={htmlFor}>
      {component.label}
    </label>
  )
}