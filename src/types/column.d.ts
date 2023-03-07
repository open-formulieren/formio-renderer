import { IFormioComponent } from './component'

export interface IFormioColumn {
  components: IFormioComponent[]

  currentWidth: number

  offset: number

  pull: number

  push: number

  sizeMobile: number

  width: number
}
