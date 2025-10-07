import {install} from '@sinonjs/fake-timers';
import type {InstalledClock} from '@sinonjs/fake-timers';
import type {Decorator} from '@storybook/react-vite';
import {Form, Formik} from 'formik';
import {type CSSProperties, useEffect} from 'react';
import {fn} from 'storybook/test';
import {toFormikValidationSchema} from 'zod-formik-adapter';

import FormSettingsProvider from '@/components/FormSettingsProvider';

/**
 * Wrap stories so that they are inside a container with the class name "utrecht-document", used
 * to wrap some 'page-global' styling.
 */
export const utrechtDocumentDecorator: Decorator = Story => {
  return (
    <div
      className="utrecht-document utrecht-document--surface"
      style={
        {
          '--utrecht-document-font-size': '16px',
        } as CSSProperties
      }
    >
      <Story />
    </div>
  );
};

export const withFormik: Decorator = (Story, context) => {
  const isDisabled = context.parameters?.formik?.disable ?? false;
  if (isDisabled) {
    return <Story />;
  }
  const initialValues = context.parameters?.formik?.initialValues || {};
  const initialErrors = context.parameters?.formik?.initialErrors || {};
  const initialTouched = context.parameters?.formik?.initialTouched || {};
  const wrapForm = context.parameters?.formik?.wrapForm ?? true;
  const onSubmit = context.parameters?.formik?.onSubmit || fn();
  const zodSchema = context.parameters?.formik?.zodSchema;
  return (
    <Formik
      initialValues={initialValues}
      initialErrors={initialErrors}
      initialTouched={initialTouched}
      enableReinitialize
      onSubmit={async values => onSubmit(values)}
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={zodSchema ? toFormikValidationSchema(zodSchema) : undefined}
    >
      {wrapForm ? (
        <Form id="storybook-withFormik-decorator-form" data-testid="storybook-formik-form">
          <Story />
        </Form>
      ) : (
        <Story />
      )}
    </Formik>
  );
};

export const withFormSettingsProvider: Decorator = (Story, {parameters}) => (
  <FormSettingsProvider
    requiredFieldsWithAsterisk={parameters?.formSettings?.requiredFieldsWithAsterisk ?? true}
    components={parameters?.formSettings?.components ?? []}
  >
    <Story />
  </FormSettingsProvider>
);

const ClockCleanup: React.FC<React.PropsWithChildren<{clock: InstalledClock}>> = ({
  clock,
  children,
}) => {
  useEffect(() => {
    return () => {
      try {
        clock.uninstall();
      } catch {
        // no-op: clock might already be uninstalled by HMR/StrictMode double-invoke
      }
    };
  }, [clock]);
  return <>{children}</>;
};

export const withMockDate: Decorator = (Story, {parameters}) => {
  const mockDate: Date = parameters.mockDate;
  const clock = install({
    now: mockDate.getTime(),
    // leave timers alone so setTimeout/interval/etc behave normally
    toFake: ['Date'],
  });

  return (
    <ClockCleanup clock={clock}>
      <Story />
    </ClockCleanup>
  );
};
