import {useFormikContext} from 'formik';
import {z} from 'zod';

import type {EmailVerificationStatus} from './types';

export const useVerificationStatus = (): EmailVerificationStatus => {
  const {status} = useFormikContext();
  const maybeVerificationStatus = status?.emailVerification;
  if (isEmailVerificationStatus(maybeVerificationStatus)) {
    return maybeVerificationStatus;
  }
  return {};
};

// Use a zod schema to validate that the data is `Record<string, Record<string, boolean | undefined>>`
const EMAIL_VERIFICATION_STATUS_SCHEMA = z.record(z.record(z.boolean().optional()));

const isEmailVerificationStatus = (
  possibleStatus: unknown
): possibleStatus is EmailVerificationStatus => {
  const result = EMAIL_VERIFICATION_STATUS_SCHEMA.safeParse(possibleStatus);
  return result.success;
};
