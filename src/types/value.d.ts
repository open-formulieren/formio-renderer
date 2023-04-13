export type Value = boolean | number | string | null;

export type Values = Value[];

export interface IValues {
  [index: string]: Value | Values;
}
