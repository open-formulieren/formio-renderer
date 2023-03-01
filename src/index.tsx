import { BASE_RENDER_CONFIGURATION } from '@lib'
import { TreeConfiguration } from '@types'
import React from 'react'

export const renderForm = ({
  callbacks = {},
  formErrors = {},
  form,
  renderConfiguration = BASE_RENDER_CONFIGURATION
}: TreeConfiguration): React.ReactNode => {
  return renderConfiguration.renderer.renderTree({
    callbacks,
    form,
    renderConfiguration,
    formErrors: formErrors
  })
}

export * from '@components'
export * from '@lib'
