import { IRendererComponent } from '@lib/renderer'

export interface IFormioForm {
  display?: 'form'

  components: IRendererComponent[]
}
