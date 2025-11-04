import {useId} from 'react';
import {FormattedMessage} from 'react-intl';

import UploadedFile from './UploadedFile';
import './UploadedFileList.scss';

export interface FileMeta {
  /**
   * Unique identifier to look up the file upload in the Formik state.
   */
  uniqueId: string;
  /**
   * The file name as uploaded by the user, including the extension.
   */
  name: string;
  /**
   * URL/endpoint to the (temporary) file upload where the file content can be downloaded
   * again.
   */
  downloadUrl: string;
  /**
   * File size, in bytes.
   */
  size: number;
  /**
   * Upload state.
   *
   * - `success` implies that the upload completed successfully
   * - `pending` means the upload is in progress
   * - `error` means something went wrong during the upload process and the user needs to
   *   retry
   */
  state: 'success' | 'pending' | 'error';
  /**
   * Error message(s) to display.
   */
  errors?: string[];
}

export interface UploadedFileListProps {
  files: FileMeta[];
  onRemove: (id: string) => Promise<void>;
  multipleAllowed?: boolean;
}

/**
 * List of files uploaded by the user, with an accessible label.
 */
const UploadedFileList: React.FC<UploadedFileListProps> = ({
  files,
  onRemove,
  multipleAllowed = false,
}) => {
  const id = useId();
  return (
    <>
      <span className="sr-only" id={id}>
        <FormattedMessage
          description="Accessible label for uploads list"
          defaultMessage="{single, select, true {Uploaded file} other {Uploaded files}}"
          values={{single: !multipleAllowed}}
        />
      </span>

      <ul className="openforms-uploaded-files-list" aria-labelledby={id}>
        {files.map(file => (
          <li key={file.uniqueId}>
            <UploadedFile {...file} onRemove={async () => await onRemove(file.uniqueId)} />
          </li>
        ))}
      </ul>
    </>
  );
};

export default UploadedFileList;
