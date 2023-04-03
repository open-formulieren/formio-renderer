export type SerializedJSONPrimitive = boolean | number | string | null;

export type SerializedJSON =
  | SerializedJSONPrimitive
  | SerializedJSON[]
  | {[key: string]: SerializedJSON};
