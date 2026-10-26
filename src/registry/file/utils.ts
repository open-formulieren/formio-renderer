import type {MimeTypeStr} from './types';

// Reference: formio's file component translateScalars method, but without the weird
// units that don't make sense for files...
// Copied from https://github.com/open-formulieren/formio-builder/blob/e296210515949eae8bc2267af95a912c04b43aee/src/registry/file/edit-validation.ts
const TRANSFORMATIONS = {
  B: Math.pow(1024, 0),
  KB: Math.pow(1024, 1),
  MB: Math.pow(1024, 2),
  GB: Math.pow(1024, 3),
};

export const getSizeInBytes = (filesize: string): number | undefined => {
  const match = /^(\d+)\s*(B|KB|MB|GB)?$/i.exec(filesize);
  if (match === null) {
    return undefined;
  }
  const size = parseInt(match[1], 10);
  const unit = (match[2] || 'B').toUpperCase() as keyof typeof TRANSFORMATIONS;
  return size * TRANSFORMATIONS[unit];
};

interface HumanFileSize {
  size: number;
  unit: 'byte' | 'kilobyte' | 'megabyte' | 'gigabyte' | 'terabyte';
}

/**
 * Takes a file size in bytes and returns the appropriate human readable value + unit
 * to use.
 */
export const humanFileSize = (size: number): HumanFileSize => {
  if (size === 0) {
    return {size: 0, unit: 'byte'};
  }
  const index = Math.floor(Math.log(size) / Math.log(1024));
  const newSize = parseFloat((size / Math.pow(1024, index)).toFixed(2));
  const unit = (['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const)[index];
  return {size: newSize, unit};
};

export const mimeTypeHasWildcard = (mimeType: MimeTypeStr): boolean => mimeType.includes('*');

/**
 * Strip the wildcard from the end of the mime type.
 *
 * Only wildcards at the end are supported.
 */
export const getMimeTypePrefix = (mimeType: MimeTypeStr): MimeTypeStr => {
  if (!mimeType.endsWith('*')) throw new Error('Only wildcards at the end are supported');
  // type cast necessary because TS doesn't know how we're trimming the subtype only
  return mimeType.slice(0, -1) as MimeTypeStr;
};
