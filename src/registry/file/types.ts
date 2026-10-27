import type {FileUploadData} from '@open-formulieren/types/dist/components/file';

/**
 * Backend `FileUploadData` data structure enriched with local client-side state for the
 * Formik state.
 *
 * `FileUploadData` is convoluted, but necessary for backwards compatibility with
 * Formio and our backend implementation.
 */
export interface FormikFileUpload extends FileUploadData {
  /**
   * Unique ID to manage/sync client side state. For persisted uploads, this property
   * is absent.
   *
   * Used to look up the upload in the Formik state, which is necessary to update
   * validation error state due to concurrent uploads potential and race conditions.
   */
  clientId?: string;
  /**
   * Tracks the client-side upload state. If unset, this means it's an existing upload
   * from the backend, and the implicit state is `success`, because only successful
   * uploads get persisted in the backend.
   */
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

/**
 * The expected return value from a file upload to the server. It is a discriminated
 * union on the `result` key.
 */
export type UploadResult = SuccessfulUploadResult | FailedUploadResult;

/**
 * Dependency injection parameters for the file component.
 *
 * Provides handlers for the upload to the backend and destroying any resources on the
 * backend when a file upload is removed in the UI.
 */
export interface FileParameters {
  upload: (file: File) => Promise<UploadResult>;
  destroy: (url: string) => Promise<void>;
}
