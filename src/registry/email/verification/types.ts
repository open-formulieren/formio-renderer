export type Mode = 'sendCode' | 'enterCode';

/**
 * The shape of the `emailVerification` key inside the Formik status prop, if present.
 *
 * Currently the backend verifies the combination of `(componentKey, email)`, which is
 * why the mapping keys are the key names (string, possibly containing periods) of the
 * email component. The values themselves are a mapping of strings (email address) to
 * boolish values, indicating the verification status for each email value.
 */
export type EmailVerificationStatus = Partial<{
  [CompKey: string]: Partial<{
    [Email: string]: boolean;
  }>;
}>;

/**
 * Outcome of a verification code request call to the backend.
 */
type RequestVerificationCodeResult = {success: true} | {success: false; errorMessage: string};

/**
 * Outcome of a verification attempt to the backend.
 */
type VerificationResult =
  | {success: true}
  | {
      success: false;
      errors: {
        code?: string;
      };
    };

/**
 * Request a verification code to be sent to the specified email address.
 *
 * If there are any issues, the return value must provide an error message to display
 * to the user.
 */
export type RequestVerificationCode = (
  componentKey: string,
  email: string
) => Promise<RequestVerificationCodeResult>;

/**
 * Submit the verification code to inform the backend.
 */
export type VerifyCode = (
  componentKey: string,
  email: string,
  code: string
) => Promise<VerificationResult>;
