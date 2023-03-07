import { IFormioComponent } from './component'

export interface IFormioForm {
  display: string

  components: IFormioComponent[]

  [index: string]: any
}
