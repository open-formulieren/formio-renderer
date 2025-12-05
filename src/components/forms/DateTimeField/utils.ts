import {format, parse, parseISO} from 'date-fns';

import type {DatePart, DatePartValues, DateTimePartValues} from './types';

// Regex for an ISO-8601 string of format YYYY-MM-DDTHH:MM:SS (can optionally include milliseconds
// and a timezone)
const RE_ISO8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;

const RE_PARTS = {
  year: '(?<year>\\d{4})',
  month: '(?<month>\\d{1,2})',
  day: '(?<day>\\d{1,2})',
};

const isValidDate = (value: Date): boolean => {
  return !isNaN(value.valueOf());
};

export interface LocaleMeta {
  datePartsOrder: DatePart[];
  dateSeparator: string;
  timeSeparator: string;
  is24HourFormat: boolean;
}

/**
 * Parse a given string into a JS Date instance with timezone information (Amsterdam). The datetime
 * is expected to be in ISO-8601 YYYY-MM-DDTHH:MM:SS format (optionally including milliseconds and
 * a timezone), or formatted according to the locale if the meta was passed.
 *
 * If the meta was passed, single digit months or days are zero-padded automatically, and seconds
 * are can be missing, e.g. '1-10-2025 15:22' (Dutch format).
 *
 * If no date could be parsed (either because it's incomplete, wrong format or just nonsensical),
 * returns `null`.
 */
export const parseDateTime = (value: string, meta?: LocaleMeta): Date | null => {
  if (!value) return null;

  // If meta is not passed, we parse it as an ISO-8601 string. Note that we do not use `parseISO`
  // directly, because it accepts a lot more than just ISO-8601 strings, e.g. '20' gets parsed into
  // '1999-12-31T23:00:00.000Z'
  if (meta === undefined) {
    if (!value.match(RE_ISO8601)) return null;
    const parsed = parseISO(value);
    return isValidDate(parsed) ? parsed : null;
  }

  // Note: assuming here that a whitespace will not be a separator for date/time parts
  const [date, time, dayPeriod] = value.split(' ');
  // eslint-disable-next-line prefer-const
  let [hour, minute, second] = time ? time.split(meta.timeSeparator) : [];

  // Seconds can be missing
  if (!hour || !minute || meta.is24HourFormat == ['AM', 'PM'].includes(dayPeriod)) return null;
  if (!meta.is24HourFormat) {
    const time12h = parse(`${hour}:${minute} ${dayPeriod}`, 'hh:mm a', new Date());
    hour = format(time12h, 'H');
  }

  const partsOrder = meta.datePartsOrder;
  const orderedParts = partsOrder.map(part => RE_PARTS[part]);
  const re = new RegExp(orderedParts.join(meta.dateSeparator));
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
  const timeBits = [
    parts.hour.padStart(2, '0'),
    parts.minute.padStart(2, '0'),
    parts.second.padStart(2, '0'),
  ];
  return dateBits.join('-') + 'T' + timeBits.join(':');
};

const TEST_DATE = new Date(2023, 4, 31, 15, 16, 45);
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
    hour: 'numeric',
    minute: '2-digit',
  });
  const parts = dateTimeFormat.formatToParts(TEST_DATE);
  const dateSeparator = parts.find(part => part.type === 'literal')?.value || '';
  const hourIndex = parts.findIndex(part => part.type === 'hour');
  const timeSeparator = parts[hourIndex + 1].value;
  const datePartsOrder: DatePart[] = parts
    .map(part => part.type)
    .filter(type => type === 'year' || type === 'month' || type === 'day');
  const is24HourFormat = !parts.find(part => part.type === 'dayPeriod');
  return {datePartsOrder, dateSeparator, timeSeparator, is24HourFormat};
};
