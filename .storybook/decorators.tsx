import type {Decorator} from '@storybook/react';
import {fn} from '@storybook/test';
import {Form, Formik} from 'formik';
import {CSSProperties} from 'react';
import {toFormikValidationSchema} from 'zod-formik-adapter';

import RendererSettingsProvider from '../src/components/RendererSettingsProvider';

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

export const withRenderSettingsProvider: Decorator = (Story, {parameters}) => (
  <RendererSettingsProvider
    requiredFieldsWithAsterisk={parameters?.renderSettings?.requiredFieldsWithAsterisk ?? true}
  >
    <Story />
  </RendererSettingsProvider>
);
