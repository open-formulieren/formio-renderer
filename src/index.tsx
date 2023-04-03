import {
  CallbacksContext,
  DEFAULT_RENDER_CONFIGURATION,
  RenderContext,
  RenderForm,
  SubmissionContext,
} from '@lib/renderer';
import {ICallbackConfiguration, IFormioForm, IRenderConfiguration} from '@types';
import React from 'react';

import {ISubmission} from './types/submission';

export * from '@components';
export * from '@lib/renderer';

export interface IFormioFormProps {
  callbacks: ICallbackConfiguration;

  configuration: IRenderConfiguration;

  form: IFormioForm;

  submission: ISubmission;
}

/**
 * _Main entrypoint for this library._
 *
 * Renderer for rendering a Form.io configuration passed as form. Iterates over children and returns
 * `React.ReactElement` containing the rendered form.
 *
 * @see {@link ?path=/docs/libraries-renderer--render-form) for more information.|RenderForm} for
 *  more information.
 * @external {CallbacksContext} Provides `RenderContext` with value set to `callbacks`.
 * @external {RenderContext} Provides `RenderContext` with value set to `configuration`.
 * @external {SubmissionContext} Provides `SubmissionContext` with value set to `submission`.
 */
export const FormioForm = ({
  form,
  callbacks = {},
  configuration = DEFAULT_RENDER_CONFIGURATION,
  submission = {data: {}, metadata: {}},
}: IFormioFormProps): React.ReactElement => {
  return (
    <CallbacksContext.Provider value={callbacks}>
      <RenderContext.Provider value={configuration}>
        <SubmissionContext.Provider value={submission}>
          <RenderForm form={form} />
        </SubmissionContext.Provider>
      </RenderContext.Provider>
    </CallbacksContext.Provider>
  );
};
