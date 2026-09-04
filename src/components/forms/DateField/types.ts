export type DateValue = string | null; // null for empty values rather than empty string

export interface DatePartValues {
  year: string;
  month: string;
  day: string;
}

export type DatePart = keyof DatePartValues;
