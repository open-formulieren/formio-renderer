import type {StoryContext, StoryFn} from '@storybook/react';
import {Formik} from 'formik';

import {ConfigurationContext} from '@/context';

export const withFormik = (Story: StoryFn, context: StoryContext) => {
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
        <form>
          <Story />
        </form>
      ) : (
        <Story />
      )}
    </Formik>
  );
};

export const withConfig = (Story: StoryFn, context: StoryContext) => {
  const config = context.parameters?.config;
  if (!config) return <Story />;
  return (
    <ConfigurationContext.Provider value={{...config}}>
      <Story />
    </ConfigurationContext.Provider>
  );
};
