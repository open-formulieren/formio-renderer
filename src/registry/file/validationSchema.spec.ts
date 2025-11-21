import type {FileComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import {FILE_COMPONENT_BOILERPLATE, buildFile, getFileConfiguration} from './test-utils';
import type {FormikFileUpload} from './types';
import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: FileComponentSchema = {
  ...FILE_COMPONENT_BOILERPLATE,
  ...getFileConfiguration(['application/pdf', 'image/png', 'image/jpeg']),
  type: 'file',
  id: 'file',
  key: 'file',
  label: 'File field',
};

const buildValidationSchema = (component: FileComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async () => undefined,
  });
  return schemas[component.key];
};

describe('file component validation', () => {
  test.each(['string', 124, false, true, ['array'], null, {object: 'value'}])(
    'does not accept non-array values (value: %s)',
    value => {
      const schema = buildValidationSchema(BASE_COMPONENT);

      const {success} = schema.safeParse(value);

      expect(success).toBe(false);
    }
  );

  test.each([
    [false, []],
    [false, undefined],
    [true, []],
    [true, undefined],
  ])('required %s (value: %s)', (required, value) => {
    const component: FileComponentSchema = {...BASE_COMPONENT, validate: {required}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(!required);
  });

  test('required with custom error message', () => {
    const component: FileComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: true},
      errors: {required: 'Custom error message for required'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse([]);

    expect(result.error?.errors[0].message).toBe('Custom error message for required');
  });

  test('accepts valid upload data with client side state', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);
    const fileData = buildFile({
      name: 'sample.pdf',
      type: 'application/pdf',
      size: 1000,
      state: 'success',
    });
    expect(fileData.clientId).not.toBeUndefined();
    expect(fileData.state).not.toBeUndefined();

    const {success} = schema.safeParse([fileData]);

    expect(success).toBe(true);
  });

  test('accepts valid upload data with server side state', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);
    const fileData = buildFile({
      name: 'sample.pdf',
      type: 'application/pdf',
      size: 1000,
      state: 'success',
      omitClientState: true,
    });
    expect(fileData.clientId).toBeUndefined();
    expect(fileData.state).toBeUndefined();

    const {success} = schema.safeParse([fileData]);

    expect(success).toBe(true);
  });

  test.each(['error', 'pending'] satisfies FormikFileUpload['state'][])(
    'rejects non-successful uploads data (state: %s)',
    (state: FormikFileUpload['state']) => {
      const schema = buildValidationSchema(BASE_COMPONENT);
      const fileData = buildFile({
        name: 'sample.pdf',
        type: 'application/pdf',
        size: 1000,
        state,
      });

      const {success} = schema.safeParse([fileData]);

      expect(success).toBe(false);
    }
  );

  test('rejects too-large uploads data', () => {
    const component: FileComponentSchema = {...BASE_COMPONENT, fileMaxSize: '3 kB'};
    const schema = buildValidationSchema(component);
    const fileData = buildFile({
      name: 'sample.pdf',
      type: 'application/pdf',
      size: 1024 * 3 + 1, // 3 KiB + 1b
      state: 'success', // it wouldn't reach this state, but let's assume it does
    });

    const {success} = schema.safeParse([fileData]);

    expect(success).toBe(false);
  });

  test('rejects too many files', () => {
    const component: FileComponentSchema = {...BASE_COMPONENT, multiple: true, maxNumberOfFiles: 2};
    const schema = buildValidationSchema(component);
    // the success state is questionable - the react-dropzone checks for max file selection
    // configuration would already lead to an error state, but the valiation schema is
    // not aware of that. so, assume a success state to prevent the state from
    // considering the whole thing as invalid.
    const fileData1 = buildFile({
      name: 'sample.pdf',
      type: 'application/pdf',
      size: 1000,
      state: 'success',
    });
    const fileData2 = buildFile({
      name: 'screenshot.png',
      type: 'image/png',
      size: 314159,
      state: 'success',
    });
    const fileData3 = buildFile({
      name: 'sensitive-data.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 1024 ** 2 * 10,
      state: 'success',
    });

    const {success} = schema.safeParse([fileData1, fileData2, fileData3]);

    expect(success).toBe(false);
  });

  test('accepts multiple files within the file size limit', () => {
    const component: FileComponentSchema = {
      ...BASE_COMPONENT,
      ...getFileConfiguration([
        'application/pdf',
        'image/png',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]),
      multiple: true,
      maxNumberOfFiles: 5,
      fileMaxSize: '10 MB',
    };
    const schema = buildValidationSchema(component);
    const fileData1 = buildFile({
      name: 'sample.pdf',
      type: 'application/pdf',
      size: 1000,
      state: 'success', // it wouldn't reach this state, but let's assume it does
    });
    const fileData2 = buildFile({
      name: 'screenshot.png',
      type: 'image/png',
      size: 314159,
      state: 'success', // it wouldn't reach this state, but let's assume it does
    });
    const fileData3 = buildFile({
      name: 'sensitive-data.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 1024 ** 2 * 10,
      state: 'success', // it wouldn't reach this state, but let's assume it does
    });

    const {success} = schema.safeParse([fileData1, fileData2, fileData3]);

    expect(success).toBe(true);
  });

  // TODO: proper testing with existing upload components and files like .msg etc.!!
  test('rejects wrong file types', () => {
    const component: FileComponentSchema = {
      ...BASE_COMPONENT,
      ...getFileConfiguration(['application/pdf']),
    };
    const schema = buildValidationSchema(component);
    const fileData = buildFile({
      name: 'sample.jpg',
      type: 'image/jpeg',
      size: 2047,
      state: 'success', // it wouldn't reach this state, but let's assume it does
    });

    const {success} = schema.safeParse([fileData]);

    expect(success).toBe(false);
  });

  test('accepts wildcard file types', () => {
    const component: FileComponentSchema = {
      ...BASE_COMPONENT,
      ...getFileConfiguration(['*']),
    };
    const schema = buildValidationSchema(component);
    const fileData = buildFile({
      name: 'sample.jpg',
      type: 'image/jpeg',
      size: 2047,
      state: 'success', // it wouldn't reach this state, but let's assume it does
    });

    const {success} = schema.safeParse([fileData]);

    expect(success).toBe(true);
  });

  test('accepts anything with blank file types configuration', () => {
    const component: FileComponentSchema = {
      ...BASE_COMPONENT,
      ...getFileConfiguration([]),
    };
    const schema = buildValidationSchema(component);
    const fileData = buildFile({
      name: 'sample.jpg',
      type: 'image/jpeg',
      size: 2047,
      state: 'success', // it wouldn't reach this state, but let's assume it does
    });

    const {success} = schema.safeParse([fileData]);

    expect(success).toBe(true);
  });
});
