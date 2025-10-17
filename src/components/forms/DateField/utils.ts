import {parseISO} from 'date-fns';

import type {DatePart, DatePartValues} from './types';

const RE_PARTS = {
  year: '(?<year>\\d{4})',
  month: '(?<month>\\d{1,2})',
  day: '(?<day>\\d{1,2})',
};

const isValidDate = (value: Date): boolean => {
  return !isNaN(value.valueOf());
};

export interface LocaleMeta {
  partsOrder: DatePart[];
  separator: string;
}

/**
 * Parse a given string into a JS Date instance. The date is expected to be in ISO-8601
 * YYYY-MM-DD format, or formatted according to the locale if the meta was passed. Note that
 * single digit months or days are zero-padded automatically, meaning YYYY-M-D is also a valid
 * format.
 *
 * If no date could be parsed (either because it's incomplete, wrong format or just
 * non-sensical), returns `null`.
 */
export const parseDate = (value: string, meta?: LocaleMeta): Date | null => {
  if (!value) return null;

  const partsOrder = meta?.partsOrder ?? ['year', 'month', 'day']; // default ISO-8601 order
  const orderedParts = partsOrder.map(part => RE_PARTS[part]);
  const re = new RegExp(orderedParts.join(meta?.separator ?? '-')); // default ISO-8601 separator
  const match = value.match(re) as RegExpMatchArray & {groups: DatePartValues};
  if (!match) return null;
  const {year, month, day} = match.groups;
  const parsed = parseISO(partsToUnvalidatedISO8601({year, month, day}));

  // Invalid dates are also instances of Date :/
  return isValidDate(parsed) ? parsed : null;
};

/**
 * Format date parts into an (unvalidated) ISO-8601 string.
 */
export const partsToUnvalidatedISO8601 = (parts: DatePartValues): string => {
  const bits = [
    parts.year.padStart(4, '0'),
    parts.month.padStart(2, '0'),
    parts.day.padStart(2, '0'),
  ];
  return bits.join('-');
};

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
