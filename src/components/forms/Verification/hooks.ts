import {useFormikContext} from 'formik';
import {useCallback} from 'react';
import {z} from 'zod';

import type {JSONObject} from '@/types';

import type {EmailVerificationStatus} from './types';

interface UseVerificationStatus {
  verificationStatus: EmailVerificationStatus;
  updateVerificationStatus: (
    component: string,
    verificationStatus: Record<string, boolean | undefined>
  ) => void;
}

// Use a zod schema to validate that the data is `Record<string, Record<string, boolean | undefined>>`
const EMAIL_VERIFICATION_STATUS_SCHEMA = z.record(z.record(z.boolean().optional()));

const isEmailVerificationStatus = (
  possibleStatus: unknown
): possibleStatus is EmailVerificationStatus => {
  const result = EMAIL_VERIFICATION_STATUS_SCHEMA.safeParse(possibleStatus);
  return result.success;
};

const EMPTY_VERIFICATION_STATUS: EmailVerificationStatus = {};

export const useVerificationStatus = (): UseVerificationStatus => {
  const {status, setStatus} = useFormikContext<JSONObject>();
  const maybeVerificationStatus = status?.emailVerification;
  const verificationStatus = isEmailVerificationStatus(maybeVerificationStatus)
    ? maybeVerificationStatus
    : EMPTY_VERIFICATION_STATUS;

  const updateVerificationStatus = useCallback(
    (component: string, componentVerificationStatus: Record<string, boolean | undefined>) => {
      const nextComponentStatus = {
        [component]: {
          ...(verificationStatus[component] ?? {}),
          ...componentVerificationStatus,
        },
      };
      const nextStatus = {
        ...status,
        emailVerification: {...verificationStatus, ...nextComponentStatus},
      };
      setStatus(nextStatus);
    },
    [status, verificationStatus, setStatus]
  );
  return {verificationStatus, updateVerificationStatus};
};
