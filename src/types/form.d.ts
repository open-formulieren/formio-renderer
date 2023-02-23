import { Component } from './component'

export interface Form {
  display: string

  components: Component[]

  [index: string]: any
}
