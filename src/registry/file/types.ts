import type {FileUploadData} from '@open-formulieren/types';

// Add internal client state to find/correlate items, but it's not relevant for the
// backend.
export interface FormikFileUpload extends FileUploadData {
  /**
   * Unique ID to manage/sync client side state. For persisted uploads, this property
   * is absent.
   */
  clientId?: string;
  state?: 'success' | 'pending' | 'error';
}

/**
 * The expected return value from a successful file upload to the server.
 */
interface SuccessfulUploadResult {
  result: 'success';
  /**
   * The API resource URL of the temporary upload.
   *
   * The URL is used in the link to download the file (again) so the user can verify the
   * correct file was uploaded. It's also passed to the `destroyFile` handler.
   */
  url: string;
}

/**
 * The expected return value from a failed file upload to the server.
 */
interface FailedUploadResult {
  result: 'failed';
  errors: string[];
}

export type UploadResult = SuccessfulUploadResult | FailedUploadResult;

export interface FileParameters {
  upload: (file: File) => Promise<UploadResult>;
  destroy: (url: string) => Promise<void>;
}
