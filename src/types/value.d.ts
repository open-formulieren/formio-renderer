export type value = boolean | number | string | null

export type values = value[]

export interface IValues {
  [index: string]: value | values
}
