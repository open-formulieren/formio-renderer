import {parseISO} from 'date-fns';

import type {DatePart, DatePartValues} from './types';

const isValidDate = (value: Date): boolean => {
  return !isNaN(value.valueOf());
};

/**
 * Parse a given string into a JS Date instance. The date is expected to be in ISO-8601
 * YYYY-MM-DD format.
 *
 * If no date could be parsed (either because it's incomplete, wrong format or just
 * non-sensical), returns `null`.
 */
export const parseDate = (value: string): Date | null => {
  if (!value) return null;
  const parsed = parseISO(value);
  // Invalid dates are also instances of Date :/
  return isValidDate(parsed) ? parsed : null;
};

/**
 * Try to parse the date parts into a valid date and return the ISO-8601 string. If the
 * date is not valid, returns `null`.
 */
export const partsToUnvalidatedISO8601 = (parts: DatePartValues): string => {
  const bits = [
    parts.year.padStart(4, '0'),
    parts.month.padStart(2, '0'),
    parts.day.padStart(2, '0'),
  ];
  return bits.join('-');
};

export interface LocaleMeta {
  partsOrder: DatePart[];
  separator: string;
}

const TEST_DATE = new Date(2023, 4, 31);
/**
 * Given a locale, figure out the order of date parts and what the separator used is.
 *
 * This uses a dummy date to format it with the provided locale using the native Intl
 * APIs and extracts the order from the formatted date.
 */
export const getDateLocaleMeta = (locale: string): LocaleMeta => {
  const dateTimeFormat = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const parts = dateTimeFormat.formatToParts(TEST_DATE);
  const separator = parts.find(part => part.type === 'literal')?.value || '';
  const partsOrder: DatePart[] = parts
    .map(part => part.type)
    .filter(type => type === 'year' || type === 'month' || type === 'day');
  return {partsOrder, separator};
};
