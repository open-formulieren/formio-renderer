import type {RequestVerificationCode, VerifyCode} from '@/components/forms/Verification/types';

/**
 * Dependency injection parameters for the email component.
 *
 * Provides handlers for the email verification flow.
 */
export interface EmailParameters {
  requestVerificationCode: RequestVerificationCode;
  verifyCode: VerifyCode;
}
