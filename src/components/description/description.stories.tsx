import { Description } from '@components'
import { FORMIO_EXAMPLE } from '@fixtures'
import { Meta } from '@storybook/react'
import { IComponentProps } from '@types'
import React from 'react'

export default {
  description: Description,
  title: 'Components / Reusable / Description'
} as Meta

export const Basic = (args: IComponentProps) => <Description {...args} />
Basic.args = {
  component: FORMIO_EXAMPLE[0]
}
