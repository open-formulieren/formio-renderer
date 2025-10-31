import {Button, Icon as UtrechtIcon} from '@utrecht/component-library-react';
import {clsx} from 'clsx';
import {useId} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import LoadingIndicator from '@/components/LoadingIndicator';
import {ValidationErrors} from '@/components/forms';
import Icon from '@/components/icons';

import FileSize from './FileSize';
import './UploadedFile.scss';

export interface UploadedFileProps {
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

/**
 * Presentation of a file/attachment uploaded by an end user.
 *
 * The file name, type and size are displayed. Long file names are truncated with an ellipsis when
 * they overflow. File sizes are displayed in a human-readable format like `14 kB` or `1.1 MB`.
 *
 * @todo Uploading state
 * @todo Upload failed state
 */
const UploadedFile: React.FC<UploadedFileProps> = ({
  name,
  downloadUrl,
  size,
  state,
  errors = [],
}) => {
  const id = useId();
  const intl = useIntl();
  const extension = name.split('.').pop();
  const hasError = errors.length > 0;
  const errorMessageId = hasError ? `${id}-error-message` : undefined;
  return (
    <div
      className={clsx('openforms-uploaded-file', hasError && 'openforms-uploaded-file--errors')}
      // TODO: check if this is correctly picked up by screenreaders
      aria-describedby={errorMessageId}
    >
      <div
        className="openforms-uploaded-file__name"
        aria-label={intl.formatMessage({
          description: 'Accessible label for uploaded file name',
          defaultMessage: 'File name',
        })}
      >
        <a
          className="utrecht-link utrecht-link--openforms"
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}
        </a>
      </div>

      {/* FIXME: Labels only apply to interactive elements, which spans/divs are not. */}
      <div className="openforms-uploaded-file__metadata">
        ({extension?.toLowerCase()}
        {extension ? ',' : undefined} <FileSize size={size} />)
      </div>

      <div className="openforms-uploaded-file__state">
        <UploadState
          state={state}
          removeButton={<RemoveButton fileName={name} onRemove={async () => alert('TODO')} />}
        />
      </div>

      {errorMessageId && (
        <div className="openforms-uploaded-file__errors">
          <ValidationErrors error={errors.join('\n')} id={errorMessageId} />
        </div>
      )}
    </div>
  );
};

interface UploadStateProps {
  state: UploadedFileProps['state'];
  removeButton: React.ReactNode;
}

const UploadState: React.FC<UploadStateProps> = ({state, removeButton}) => {
  switch (state) {
    case 'pending': {
      return (
        <LoadingIndicator
          description={
            <FormattedMessage
              description="Pending file upload accessible description."
              defaultMessage="Uploading..."
            />
          }
          size="small"
        />
      );
    }
    case 'success':
    case 'error': {
      return removeButton;
    }
    default: {
      const exhaustiveCheck: never = state;
      throw new Error(`Unhandled state: ${exhaustiveCheck}`);
    }
  }
};

interface RemoveButtonProps {
  fileName: string;
  onRemove: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
}

const RemoveButton: React.FC<RemoveButtonProps> = ({fileName, onRemove}) => {
  const intl = useIntl();
  return (
    <Button
      appearance="subtle-button"
      hint="danger"
      onClick={onRemove}
      title={intl.formatMessage({
        description: 'Button title to remove uploaded file',
        defaultMessage: 'Remove',
      })}
    >
      <UtrechtIcon>
        <Icon icon="remove" />
      </UtrechtIcon>
      <span className="sr-only">
        <FormattedMessage
          description="Accessible remove icon/button label for uploaded file."
          defaultMessage="Remove ''{fileName}'"
          values={{fileName}}
        />
      </span>
    </Button>
  );
};

export default UploadedFile;
