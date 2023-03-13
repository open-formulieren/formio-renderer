import { CharCount, ICharCountProps } from '@components'
import { FORMIO_EXAMPLE } from '@fixtures'
import { Meta } from '@storybook/react'
import React from 'react'

export default {
  component: CharCount,
  title: 'Components / Reusable / CharCount'
} as Meta

export const CharCountShown = (args: ICharCountProps) => <CharCount {...args} />
CharCountShown.args = {
  component: FORMIO_EXAMPLE[0],
  count: 10,
  pristine: false
} as ICharCountProps

export const PristineCharCountNotShown = (args: ICharCountProps) => <CharCount {...args} />
PristineCharCountNotShown.args = {
  component: FORMIO_EXAMPLE[0],
  count: 10,
  pristine: true
} as ICharCountProps
