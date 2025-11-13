import {ButtonGroup} from '@utrecht/button-group-react';
import {Link, Paragraph} from '@utrecht/component-library-react';
import {Form, Formik} from 'formik';
import type {FormikErrors} from 'formik';
import {FormattedMessage, useIntl} from 'react-intl';
import type {IntlShape} from 'react-intl';
import {z} from 'zod';
import {toFormikValidationSchema} from 'zod-formik-adapter';

import FormFieldContainer from '@/components/FormFieldContainer';
import {TextField} from '@/components/forms';

import EnterCodeButton from './EnterCodeButton';
import ModeField from './ModeField';
import SendCodeButton from './SendCodeButton';
import './VerificationForm.scss';
import type {Mode, RequestVerificationCode, VerifyCode} from './types';

const getValidationSchema = (intl: IntlShape) =>
  z.object({
    code: z
      .string()
      .length(
        6,
        intl.formatMessage({
          description: 'Validation error message for verification codes with length != 6',
          defaultMessage: 'The verification code must contain exactly six characters.',
        })
      )
      .regex(
        /[A-Z0-9]{6}/,
        intl.formatMessage({
          description: 'Validation error message for verification code pattern',
          defaultMessage: 'The verification code may only contain letters (A-Z) and numbers (0-9).',
        })
      ),
  });

export interface VerificationFormProps {
  componentKey: string;
  emailAddress: string;
  onRequestVerificationCode: RequestVerificationCode;
  onVerifyCode: VerifyCode;
  onVerified: () => void;
  onErrorMessage: (message: string) => void;
}

export interface Values {
  mode: Mode;
  code: string;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  componentKey,
  emailAddress,
  onRequestVerificationCode,
  onVerifyCode,
  onVerified,
  onErrorMessage,
}) => {
  const intl = useIntl();

  if (!emailAddress) throw new Error('Email address may not be empty.');

  return (
    <Formik<Values>
      initialValues={{mode: 'sendCode', code: ''}}
      validateOnChange={false}
      validateOnBlur={false}
      validationSchema={toFormikValidationSchema(getValidationSchema(intl))}
      /**
       * On Formik submit, submit the verification code to the backend. If all is okay,
       * the local state is updated so that the success message is displayed, otherwise
       * display any validation errors.
       */
      onSubmit={async (values, helpers) => {
        // setError(null);
        const result = await onVerifyCode(componentKey, emailAddress, values.code);
        if (result.success) {
          onVerified();
          return;
        }
        const errors: FormikErrors<Values> = result.errors;
        helpers.setErrors(errors);
      }}
    >
      {({values: {mode}, setFieldValue}) => (
        <Form className="openforms-email-verification-form" noValidate>
          {/*Can't use a <form> element here - as it would result in nested form tags due
             to the outer FormioForm rendering one already*/}
          <Paragraph>
            <FormattedMessage
              description="Email verification modal body text"
              defaultMessage={`You are verifying the email address <link>{emailAddress}</link>.
            First, we need to send you a verification code on this email address. Then,
            you need to enter the code to confirm it.`}
              values={{
                emailAddress,
                link: chunks => <Link href={`mailto:${emailAddress}`}>{chunks}</Link>,
              }}
            />
          </Paragraph>

          <FormFieldContainer>
            <ModeField />
            {mode === 'enterCode' && (
              <TextField
                name="code"
                isRequired
                label={
                  <FormattedMessage
                    description="Email verification: code input field label"
                    defaultMessage="Enter the six-character code"
                  />
                }
                pattern="[A-Z0-9]{6}"
                description={
                  <FormattedMessage
                    description="Email verification: code input field description"
                    defaultMessage="The code is exactly six characters long and consists of only uppercase letters and numbers."
                  />
                }
                onChange={event => {
                  setFieldValue('code', event.target.value.toUpperCase());
                }}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
            )}
          </FormFieldContainer>

          <ButtonGroup direction="column">
            {mode === 'sendCode' && (
              <SendCodeButton
                componentKey={componentKey}
                emailAddress={emailAddress}
                onRequestVerificationCode={onRequestVerificationCode}
                onError={onErrorMessage}
              />
            )}
            {mode === 'enterCode' && <EnterCodeButton />}
          </ButtonGroup>
        </Form>
      )}
    </Formik>
  );
};

export default VerificationForm;
