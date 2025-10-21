import {parseISO} from 'date-fns';

import type {DatePart, DatePartValues, DateTimePartValues} from './types';

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
 * Parse a given string into a JS Date instance with timezone information (Amsterdam). The datetime
 * is expected to be in ISO-8601 YYYY-MM-DDTHH:MM:SS format (optionally including timezone
 * information), or formatted according to the locale if the meta was passed. Note that single digit
 * months or days are zero-padded automatically, and passing a locale formatted
 * value without seconds is also valid, e.g. '1-10-2025 11:22' (Dutch format).
 *
 * If no date could be parsed (either because it's incomplete, wrong format or just nonsensical),
 * returns `null`.
 *
 * Note: we assume that the formatted string has 24-hour time format, and includes a ':' time
 * separator.
 */
export const parseDateTime = (value: string, meta?: LocaleMeta): Date | null => {
  if (!value) return null;

  const expectISO8601String = meta === undefined;
  // Remove timezone information (only if string is ISO-8601)
  if (expectISO8601String) value = value.slice(0, 19);

  // If the locale meta was passed, we try to parse it as a formatted string. Otherwise, parse as
  // ISO-8601 string.
  const separator = expectISO8601String ? 'T' : ' ';
  const [date, time] = value.split(separator);
  const [hour, minute, second] = time ? time.split(':') : [];

  // Seconds may not be missing for an ISO-8601 string
  if (!hour || !minute || (!second && expectISO8601String)) return null;

  const partsOrder = meta?.partsOrder ?? ['year', 'month', 'day']; // default ISO-8601 order
  const orderedParts = partsOrder.map(part => RE_PARTS[part]);
  const re = new RegExp(orderedParts.join(meta?.separator ?? '-')); // default ISO-8601 separator
  const match = date.match(re) as RegExpMatchArray & {groups: DatePartValues};
  if (!match) return null;
  const {year, month, day} = match.groups;
  const parsed = parseISO(
    partsToUnvalidatedISO8601({
      year,
      month,
      day,
      hour,
      minute,
      second: second ?? '00',
    })
  );

  // Invalid dates are also instances of Date :/
  return isValidDate(parsed) ? parsed : null;
};

/**
 * Format date and time parts into an (unvalidated) ISO-8601 string.
 */
export const partsToUnvalidatedISO8601 = (parts: DateTimePartValues): string => {
  const dateBits = [
    parts.year.padStart(4, '0'),
    parts.month.padStart(2, '0'),
    parts.day.padStart(2, '0'),
  ];
  const timeBits = [parts.hour, parts.minute, parts.second];
  return dateBits.join('-') + 'T' + timeBits.join(':');
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
