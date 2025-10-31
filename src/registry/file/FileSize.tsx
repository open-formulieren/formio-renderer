import {FormattedNumber} from 'react-intl';

interface HumanFileSize {
  size: number;
  unit: 'byte' | 'kilobyte' | 'megabyte' | 'gigabyte' | 'terabyte';
}

/**
 * Takes a file size in bytes and returns the appropriate human readable value + unit
 * to use.
 */
const humanFileSize = (size: number): HumanFileSize => {
  if (size === 0) {
    return {size: 0, unit: 'byte'};
  }
  const index = Math.floor(Math.log(size) / Math.log(1024));
  const newSize = parseFloat((size / Math.pow(1024, index)).toFixed(2));
  const unit = (['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const)[index];
  return {size: newSize, unit};
};

export interface FileSizeProps {
  /**
   * File size in bytes.
   */
  size: number;
}

const FileSize: React.FC<FileSizeProps> = ({size: sizeInBytes}) => {
  const {size, unit} = humanFileSize(sizeInBytes);
  return <FormattedNumber value={size} style="unit" unit={unit} />;
};

export default FileSize;
