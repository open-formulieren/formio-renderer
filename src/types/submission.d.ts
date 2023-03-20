import { SerializedJSON } from './json'
import { IValues } from './value'

export interface ISubmission {
  data: IValues
  metadata?: SerializedJSON
}
