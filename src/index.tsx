import { Columns, Content, Form, TextField } from '@components'
import { BaseRenderer } from '@lib'
import { TreeConfiguration, RenderConfiguration } from '@types'

export const DEFAULT_RENDER_CONFIGURATION: RenderConfiguration = {
  components: [
    {
      component: Form,
      type: 'form'
    },
    {
      component: Columns,
      type: 'columns'
    },
    {
      component: Content,
      type: 'content'
    },
    {
      component: TextField,
      type: 'textfield'
    }
  ],
  renderer: BaseRenderer
}

export const renderForm = ({
  callbacks = {},
  formErrors = {},
  form,
  renderConfiguration = DEFAULT_RENDER_CONFIGURATION
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
