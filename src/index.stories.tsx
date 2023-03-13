import { FormioForm, IFormioFormProps } from './index'
import { FORMIO_EXAMPLE } from '@fixtures'
import { Meta } from '@storybook/react'
import React from 'react'

export default {
  component: FormioForm,
  title: 'Getting started / FormioForm'
} as Meta

export const Basic = (args: IFormioFormProps) => <FormioForm {...args} />
Basic.args = {
  form: {
    components: FORMIO_EXAMPLE,
    display: 'form'
  }
} as IFormioFormProps
