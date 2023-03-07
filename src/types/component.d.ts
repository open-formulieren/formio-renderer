import { ComponentSchema } from 'formiojs'

interface IFormioComponent extends ComponentSchema {
  type: string

  [index: string]: any
}
