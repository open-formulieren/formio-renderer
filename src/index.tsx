import { IValues } from './types/values'
import {
  CallbacksContext,
  DEFAULT_RENDER_CONFIGURATION,
  RenderContext,
  RenderForm,
  ValuesContext
} from '@lib/renderer'
import { ICallbackConfiguration, IFormioForm, IRenderConfiguration } from '@types'
import React from 'react'

export * from '@components'
export * from '@lib/renderer'

export interface FormioFormProps {
  callbacks: ICallbackConfiguration

  configuration: IRenderConfiguration

  form: IFormioForm

  values: IValues
}

/**
 * Renders the Form.io `form` based on the `configuration`
 */
export const FormioForm = ({
  form,
  callbacks = {},
  configuration = DEFAULT_RENDER_CONFIGURATION,
  values = {}
}: FormioFormProps): React.ReactElement => {
  return (
    <CallbacksContext.Provider value={callbacks}>
      <RenderContext.Provider value={configuration}>
        <ValuesContext.Provider value={values}>
          <RenderForm form={form} />
        </ValuesContext.Provider>
      </RenderContext.Provider>
    </CallbacksContext.Provider>
  )
}
