import type {Decorator} from '@storybook/react';
import {Formik} from 'formik';
import {CSSProperties} from 'react';

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
  return (
    <Formik
      initialValues={initialValues}
      initialErrors={initialErrors}
      initialTouched={initialTouched}
      enableReinitialize
      onSubmit={(values, formikHelpers) => console.log(values, formikHelpers)}
    >
      {wrapForm ? (
        <form id="storybook-withFormik-decorator-form" data-testid="storybook-formik-form">
          <Story />
        </form>
      ) : (
        <Story />
      )}
    </Formik>
  );
};
