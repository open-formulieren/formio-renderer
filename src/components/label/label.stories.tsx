import { Label } from '@components'
import { FORMIO_EXAMPLE } from '@fixtures'
import { Meta } from '@storybook/react'
import { IComponentProps } from '@types'
import React from 'react'

export default {
  labels: Label,
  title: 'Components / Reusable / Label'
} as Meta

export const Basic = (args: IComponentProps) => <Label {...args} />
Basic.args = {
  component: FORMIO_EXAMPLE[0]
}
