export interface TimePartValues {
  hour: string;
  minute: string;
  second: string;
}
export type TimePart = keyof TimePartValues;

export type TimeInputParts = Omit<TimePartValues, 'second'>;
export type TimeInputPart = keyof TimeInputParts;
