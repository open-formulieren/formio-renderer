import { BASE_RENDER_CONFIGURATION } from '../../index'
import { BaseRenderer } from './renderer'
import { FORMIO_EXAMPLE } from '@fixtures'

export default {
  title: 'Libraries / renderer / BaseRenderer',
  component: BaseRenderer
}

export const formioExampleConfiguration = () =>
  BaseRenderer.renderTree({
    callbacks: {},
    form: {
      components: FORMIO_EXAMPLE
    },
    formErrors: {},
    renderConfiguration: BASE_RENDER_CONFIGURATION
  })
