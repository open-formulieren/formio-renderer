export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONValue[] | JSONObject;
export type JSONObject = {
  [K: string]: JSONValue;
};
