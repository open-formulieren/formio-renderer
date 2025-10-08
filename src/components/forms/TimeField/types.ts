export interface TimePartValues {
  hour: string;
  minute: string;
  second: string;
}

export type TimePart = keyof TimePartValues;
