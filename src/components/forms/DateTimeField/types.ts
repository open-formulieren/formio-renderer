export type DateTimeValue = string | null; // null for empty values rather than empty string

export interface DatePartValues {
  year: string;
  month: string;
  day: string;
}

export interface DateTimePartValues extends DatePartValues {
  hour: string;
  minute: string;
  second: string;
}

export type DatePart = keyof DatePartValues;
