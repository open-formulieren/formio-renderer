import { ComponentSchema } from 'formiojs'

export interface IFormioForm {
  display: string

  components: ComponentSchema[]

  [index: string]: any
}
