import {Paragraph} from '@utrecht/component-library-react';
import {clsx} from 'clsx';
import {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import type {Accept, FileRejection} from 'react-dropzone';
import {FormattedMessage} from 'react-intl';

import FileSize from './FileSize';
import './UploadInput.scss';

const DEFAULT_MAX_SIZE: number = 1024 ** 2 * 50; // 50 MiB

export interface UploadInputProps {
  /**
   * Input ID to link label and input programmatically together.
   */
  inputId: string;
  /**
   * Callback for dropped/selected files, both for accepted and rejected files.
   */
  onFileAdded: (file: File | FileRejection) => Promise<void>;
  /**
   * Additional aria-describedby ids, e.g. for field-level validation errors.
   */
  'aria-describedby'?: string;
  /**
   * The maximum size of an individual file, in bytes.
   */
  maxSize?: number;
  /**
   * Valid mime type or file extension.
   *
   * @see {Link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file#accept}
   *
   * @todo Facilitate our own mapping between mimetypes & extensions?
   */
  accept?: Accept;
  /**
   * Maximum number of files allowed at once. Set to `0` for no limit (the default).
   */
  maxFiles?: number;
  multiple?: boolean;
}

/**
 * A file input to upload one or more files that also accepts drag and drop of files.
 */
const UploadInput: React.FC<UploadInputProps> = ({
  inputId,
  onFileAdded,
  accept,
  maxFiles = 0,
  maxSize = DEFAULT_MAX_SIZE,
  multiple = false,
  'aria-describedby': ariaDescribedBy,
}) => {
  const [readyForDrop, setReadyForDrop] = useState(false);
  const descriptionId = `${inputId}-description`;

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const allFiles: (File | FileRejection)[] = [...fileRejections, ...acceptedFiles];
      allFiles.forEach(fileOrRejection => onFileAdded(fileOrRejection));
    },
    [onFileAdded]
  );
  const {getRootProps, getInputProps, isDragActive, isDragReject} = useDropzone({
    accept,
    maxFiles,
    maxSize,
    multiple,
    onDragEnter: () => {
      setReadyForDrop(true);
    },
    onDragLeave: () => {
      setReadyForDrop(false);
    },
    onDrop,
  });
  return (
    <div
      {...getRootProps({
        role: 'button', // role="presentation" (the default) is not ideal
        className: clsx(
          'openforms-upload-input',
          isDragActive && 'openforms-upload-input--file-drag-over',
          isDragReject && 'openforms-upload-input--file-drag-reject'
        ),
      })}
    >
      <input
        {...getInputProps({
          id: inputId,
          'aria-describedby': [descriptionId, ariaDescribedBy].filter(Boolean).join(' '),
        })}
      />
      <Paragraph id={descriptionId}>
        {/* TODO: DH wants to get rid of the file size limit information - see if we can
        make this configurable */}
        <FormattedMessage
          description="Description/label for upload drop zone."
          defaultMessage={`{multiple, select,
            false {Drop, or click to select a file to upload.}
            other {Drop, or click to select {limit, select,
              0 {}
              other {up to {limit}}
            } files to upload.}
          }
          The maximum size of a single file is <fileSize></fileSize>.`}
          values={{
            multiple,
            limit: maxFiles,
            fileSize: () => <FileSize size={maxSize} />,
          }}
        />
      </Paragraph>

      <div role="status" aria-live="polite" className="sr-only">
        {readyForDrop && (
          <FormattedMessage
            description="Accessible status indicator that the file can be dropped."
            defaultMessage="The file(s) are ready to drop."
          />
        )}
      </div>
    </div>
  );
};

export default UploadInput;
