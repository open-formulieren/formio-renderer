import {FormattedNumber} from 'react-intl';

import {humanFileSize} from './utils';

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
