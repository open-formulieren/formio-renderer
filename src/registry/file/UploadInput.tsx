import {Paragraph} from '@utrecht/component-library-react';
import {clsx} from 'clsx';
import {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import type {Accept, FileRejection} from 'react-dropzone';
import {FormattedMessage} from 'react-intl';

import FileSize from './FileSize';
import './UploadInput.scss';
import {DEFAULT_MAX_SIZE} from './constants';

export interface UploadInputProps {
  /**
   * Input ID to link label and input programmatically together.
   */
  inputId: string;
  /**
   * Callback for dropped/selected files, both for accepted and rejected files.
   */
  onFilesAdded: (files: (File | FileRejection)[]) => Promise<void>;
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
   * Maximum number of files accepted by the field. Set to `undefined` for no limit (the default).
   *
   * This is the upper limit for the `maxFilesToSelect` value - `maxFilesToSelect` is
   * equal to * `maxFiles - currentAmountOfUploads`.
   */
  maxFiles?: number;
  /**
   * The maximum number of files that can still be selected at once. Equal to or less
   * than `maxFilesToSelect`, if set.
   *
   * @example If `maxFilesToSelect` is 5 and the user first selects 2 files, then
   *          `maxFilesToSelect` will be set to `3`.
   */
  maxFilesToSelect?: number;
  multiple?: boolean;
  onBlur?: React.FocusEventHandler;
}

/**
 * A file input to upload one or more files that also accepts drag and drop of files.
 */
const UploadInput: React.FC<UploadInputProps> = ({
  inputId,
  onFilesAdded,
  accept,
  maxFiles,
  maxFilesToSelect = 0,
  maxSize = DEFAULT_MAX_SIZE,
  multiple = false,
  'aria-describedby': ariaDescribedBy,
  onBlur,
}) => {
  const [readyForDrop, setReadyForDrop] = useState(false);
  const descriptionId = `${inputId}-description`;

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const allFiles: (File | FileRejection)[] = [...fileRejections, ...acceptedFiles];
      onFilesAdded(allFiles);
    },
    [onFilesAdded]
  );
  const {getRootProps, getInputProps, isDragActive, isDragReject} = useDropzone({
    accept,
    maxFiles: maxFilesToSelect ?? 0,
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
        onBlur: onBlur,
      })}
    >
      <input
        {...getInputProps({
          id: inputId,
          'aria-describedby': [descriptionId, ariaDescribedBy].filter(Boolean).join(' '),
          onBlur: onBlur,
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
            limit: maxFiles ?? 0,
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
