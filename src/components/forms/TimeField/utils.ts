import type {TimeInputPart, TimePartValues} from './types';

const RE_PARTS = {
  hour: '(?<hour>\\d{1,2})',
  minute: '(?<minute>\\d{1,2})',
};

/**
 * Parse a given string into a TimePartValues. The time is expected to be in ISO-8601
 * HH:MM:SS format. Note that single digit hours, minutes or seconds are zero-padded
 * automatically, meaning HH:M:S is also a valid format.
 *
 * If no time could be parsed (either because it's incomplete, wrong format or just
 * non-sensical), returns `null`.
 */
export const parseTime = (value: string): TimePartValues | null => {
  if (!value) return null;

  const partsOrder: TimeInputPart[] = ['hour', 'minute'];
  const orderedParts = partsOrder.map(part => RE_PARTS[part]);
  const re = new RegExp(orderedParts.join(':')); // default ISO-8601 separator
  const match = value.match(re) as RegExpMatchArray & {groups: TimePartValues};
  if (!match) return null;

  const [rawHour = '', rawMinute = ''] = value.split(':');
  if (Number(rawHour) > 23 || Number(rawMinute) > 59) return null;

  const parsed = partsToUnvalidatedISO8601({...match.groups, second: '00'});
  const [hour, minute, second] = parsed.split(':');
  return {hour, minute, second};
};

/**
 * Try to parse the time parts into a valid time and return the ISO-8601 string. If the
 * time is not valid, returns `null`.
 */
export const partsToUnvalidatedISO8601 = (parts: TimePartValues): string => {
  const bits = [
    parts.hour.padStart(2, '0'),
    parts.minute.padStart(2, '0'),
    parts.second.padStart(2, '0'),
  ];
  return bits.join(':');
};
