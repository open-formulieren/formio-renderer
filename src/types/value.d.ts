/*
 TODO: value types need some overhaul, ideally we make them formio component type
 specific through a generic mechanisms. E.g. the value of a file component is
 *always* an array of objects, while the value of a checkbox is a boolean (possibly
 null?).

 Next, the formio component schema allows keys to be specified as foo.bar which
 results in a {"foo": {"bar": <value>}} datastructure. Due to their not being a
 well-defined, guaranteed mechanism for not-filled out fields, it's possible that
 certain (sub) keys are missing and lookups result in 'undefined'.
*/

export type Value = boolean | number | string | null;

export type Values = Value[];

export interface IValues {
  [index: string]: Value | Values | IValues;
}
