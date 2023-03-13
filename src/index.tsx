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

export interface IFormioFormProps {
  callbacks: ICallbackConfiguration

  configuration: IRenderConfiguration

  form: IFormioForm

  submission: ISubmission
}

/**
 * _Main entrypoint for this library._
 *
 * Renderer for rendering a Form.io configuration passed as form. Iterates over children and returns
 * `React.ReactElement` containing the rendered form.
 *
 * Configuring custom components
 * ---
 *
 * `configuration` expects a `IRenderConfiguration` which is made available via
 * `RenderContext`. The IRenderConfiguration's `components` entry should contain a mapping
 * between a component type and the (React) component. Overriding RenderContext allows for
 * specifying components.
 *
 * All components receive the `IComponentProps` as props containing the required context to render
 * the component. Components should return a React.ReactElement.
 *
 * @external {RenderContext} Provides `RenderContext` with value set to `configuration`.
 */
export const FormioForm = ({
  form,
  callbacks = {},
  configuration = DEFAULT_RENDER_CONFIGURATION,
  submission = { data: {}, metadata: {} }
}: IFormioFormProps): React.ReactElement => {
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
