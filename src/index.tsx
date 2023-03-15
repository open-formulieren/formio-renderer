import { DEFAULT_RENDER_CONFIGURATION, RenderContext, RenderForm } from '@lib/renderer'
import { IFormioForm, IRenderConfiguration } from '@types'
import React from 'react'

export * from '@components'

export interface FormioFormProps {
  configuration: IRenderConfiguration

  form: IFormioForm
}

/**
 * Renders the Form.io `form` based on the `configuration`
 */
export const FormioForm = ({
  configuration = DEFAULT_RENDER_CONFIGURATION,
  form
}: FormioFormProps): React.ReactElement => {
  return (
    <RenderContext.Provider value={configuration}>
      <RenderForm form={form} />
    </RenderContext.Provider>
  )
}
