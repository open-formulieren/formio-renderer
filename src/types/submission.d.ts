import { SerializedJSON } from './json'
import { IValues } from './values'

export interface ISubmission {
  data: IValues
  metadata?: SerializedJSON
}
