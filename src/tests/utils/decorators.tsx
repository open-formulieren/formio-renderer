import {DecoratorFunction} from '@storybook/csf';
import {ReactFramework} from '@storybook/react';
import {Formik} from 'formik';

export const FormikDecorator: DecoratorFunction<ReactFramework> = (Story, context) => {
  const initialValues = context.parameters?.formik?.initialValues || {};
  const initialErrors = context.parameters?.formik?.initialErrors || {};
  return (
    <Formik
      initialValues={initialValues}
      initialErrors={initialErrors}
      enableReinitialize
      onSubmit={(values, formikHelpers) => console.log(values, formikHelpers)}
    >
      <Story />
    </Formik>
  );
};
