import { Columns, Content, Form, TextField } from '@components'
import { BaseRenderer } from '@lib/renderer'
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
  form,
  renderConfiguration = DEFAULT_RENDER_CONFIGURATION,
  callbacks = {}
}: TreeConfiguration): React.ReactNode => {
  return renderConfiguration.renderer.renderTree({ form, renderConfiguration, callbacks })
}

export * from '@components'
