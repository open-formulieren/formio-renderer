import { IComponentProps } from '@types'
import clsx from 'clsx'
import React from 'react'

export interface ICharCountProps extends IComponentProps {
  count: number

  pristine: boolean
}

/**
 * Shows `count` as number of characters.
 */
export const CharCount = (charCountProps: ICharCountProps): React.ReactElement | null => {
  const { count, pristine } = charCountProps
  const className = clsx(`of-${charCountProps.component.type}__charcount`)

  if (pristine) {
    return null
  }

  return <span className={className}>{count} characters</span>
}
