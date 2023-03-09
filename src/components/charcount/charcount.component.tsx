import { IComponentProps } from '@types'
import clsx from 'clsx'
import React from 'react'

/**
 * Shows `count` as number of characters.
 */
export const CharCount = (componentProps: IComponentProps): React.ReactElement | null => {
  const { count, pristine } = componentProps
  const className = clsx(`of-${componentProps.component.type}__charcount`)

  if (pristine) {
    return null
  }

  return <span className={className}>{count} characters</span>
}
