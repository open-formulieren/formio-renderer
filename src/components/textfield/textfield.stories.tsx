import { ITextFieldProps, TextField } from '@components'
import { FORMIO_EXAMPLE } from '@fixtures'
import { Meta } from '@storybook/react'
import React from 'react'

export default {
  component: TextField,
  title: 'Components / Textfield'
} as Meta

export const Basic = (args: ITextFieldProps) => <TextField {...args} />
Basic.args = {
  component: FORMIO_EXAMPLE[0]
}
