import { Errors, IErrorsProps } from '@components'
import { FORMIO_EXAMPLE } from '@fixtures'
import { Meta } from '@storybook/react'
import React from 'react'

export default {
  errors: Errors,
  title: 'Components / Reusable / Errors'
} as Meta

export const Basic = (args: IErrorsProps) => <Errors {...args} />
Basic.args = {
  component: FORMIO_EXAMPLE[0]
}
