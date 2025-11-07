/**
 * @see `#/components/schemas/LoginOption` in the API spec.
 */
export interface LoginOption {
  identifier: string;
  label: string;
  url: string;
  logo?: {
    title: string;
    imageSrc: string;
    href: string;
    appearance: 'dark' | 'light';
  };
  isForGemachtigde: boolean;
}

/**
 * @see `#/components/schemas/SubmissionCoSignStatus` in the API spec.
 */
export interface SubmissionCoSignStatus {
  readonly coSigned: boolean;
  readonly representation: string;
}

export interface CosignOldParameters {
  getCosignStatus: () => Promise<SubmissionCoSignStatus>;
  getLoginOption: (authPlugin: string) => LoginOption | null;
}
