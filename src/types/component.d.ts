import { ComponentSchema } from 'formiojs'

interface Component extends ComponentSchema {
  [index: string]: any
}
