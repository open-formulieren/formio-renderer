import { ISubmission } from './types/submission'
import {
  CallbacksContext,
  DEFAULT_RENDER_CONFIGURATION,
  RenderContext,
  RenderForm,
  SubmissionContext
} from '@lib/renderer'
import { ICallbackConfiguration, IFormioForm, IRenderConfiguration } from '@types'
import React from 'react'

export * from '@components'
export * from '@lib/renderer'

export interface FormioFormProps {
  callbacks: ICallbackConfiguration

  configuration: IRenderConfiguration

  form: IFormioForm

  submission: ISubmission
}

/**
 * Renders the Form.io `form` based on the `configuration`
 */
export const FormioForm = ({
  form,
  callbacks = {},
  configuration = DEFAULT_RENDER_CONFIGURATION,
  submission = { data: {}, metadata: {} }
}: FormioFormProps): React.ReactElement => {
  return (
    <CallbacksContext.Provider value={callbacks}>
      <RenderContext.Provider value={configuration}>
        <SubmissionContext.Provider value={submission}>
          <RenderForm form={form} />
        </SubmissionContext.Provider>
      </RenderContext.Provider>
    </CallbacksContext.Provider>
  )
}
