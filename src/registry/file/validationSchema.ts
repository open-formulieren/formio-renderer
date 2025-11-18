import type {FileComponentSchema} from '@open-formulieren/types';
import {ErrorCode} from 'react-dropzone';
import type {FileRejection} from 'react-dropzone';
import type {IntlShape} from 'react-intl';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

import {DEFAULT_MAX_SIZE} from './constants';
import {getSizeInBytes, humanFileSize} from './utils';

const FILE_TOO_LARGE_ERROR = defineMessage({
  description: 'File upload error message: file too large',
  defaultMessage: 'The file must be smaller than {fileMaxSize}.',
});

export const TOO_MANY_FILES_ERROR = defineMessage({
  description: 'File upload error message: too many files',
  defaultMessage: `Too many files uploaded. You can upload {maxNumberOfFiles, plural,
      one {one file.}
      other {up to {maxNumberOfFiles} files}
    }.`,
});

const INVALID_TYPE_ERROR = defineMessage({
  description: 'File upload error message: invalid file type',
  defaultMessage: 'The uploaded file type is not an allowed type. It must be {allowedTypes}.',
});

const formattedTypeLabels = (intl: IntlShape, typeLabels: string[]): string => {
  if (typeLabels.length === 1) return typeLabels[0];
  const head = typeLabels.slice(0, -1);
  const last = typeLabels.slice(-1)[0];
  return intl.formatMessage(
    {
      description: 'Human readable description of allowed file types/extensions.',
      defaultMessage: '{fileTypes} or {lastOption}',
    },
    {
      fileTypes: head.join(', '),
      lastOption: last,
    }
  );
};

/**
 * Given a list of file errors produced by react-dropzone, transform them into
 * localized error messages. The error messages are joined by newlines.
 *
 * This is managed outside of the regular zod validation schema because drag-and-drop
 * events + file upload selection have a different interaction pattern than regular
 * form inputs.
 */
export const transformReactDropzoneErrors = (
  intl: IntlShape,
  componentDefinition: FileComponentSchema,
  fileWithErrors: FileRejection
): string => {
  const {fileMaxSize, maxNumberOfFiles, file: fileTypeConfiguration} = componentDefinition;
  const {errors} = fileWithErrors;
  const {allowedTypesLabels} = fileTypeConfiguration;
  return errors
    .map(({code, message}) => {
      // there is an enum of possible error codes, but it could also be any string. We
      // detect the known codes and translate, otherwise we fall back to the message as-is.
      switch (code) {
        case ErrorCode.FileInvalidType: {
          return intl.formatMessage(INVALID_TYPE_ERROR, {
            allowedTypes: formattedTypeLabels(intl, allowedTypesLabels),
          });
        }
        case ErrorCode.FileTooLarge: {
          return intl.formatMessage(FILE_TOO_LARGE_ERROR, {fileMaxSize});
        }
        case ErrorCode.FileTooSmall: {
          return intl.formatMessage({
            description: 'File upload error message: file too small',
            defaultMessage: 'The file is too small.',
          });
        }
        case ErrorCode.TooManyFiles: {
          return intl.formatMessage(TOO_MANY_FILES_ERROR, {maxNumberOfFiles});
        }
        default: {
          return message;
        }
      }
    })
    .join('\n');
};

/**
 * Build the validation schema for a single file in the uploads array.
 */
const buildFileValidationSchema = (
  intl: IntlShape,
  sizeInBytes: number,
  fileTypeConfiguration: FileComponentSchema['file']
) => {
  const {type: allowedMimeTypes, allowedTypesLabels} = fileTypeConfiguration;

  // empty string -> gets turned into undefined by Formik so the .optional is needed.
  const emptyString = z.literal('').optional();
  let sizeSchema = z.number().positive().finite();
  if (sizeInBytes) {
    const {size, unit} = humanFileSize(sizeInBytes);
    const message = intl.formatMessage(FILE_TOO_LARGE_ERROR, {
      fileMaxSize: intl.formatNumber(size, {style: 'unit', unit}),
    });
    sizeSchema = sizeSchema.max(sizeInBytes, {message});
  }

  // TODO: check what invalid mime type detection from the browser does here, e.g. a `.msg`
  // file
  let typeSchema: z.ZodString | z.ZodEffects<z.ZodString> = z.string();
  // empty mime types array or wildcard inside it imply that any file type is allowed
  if (allowedMimeTypes.length !== 0 && !allowedMimeTypes.includes('*')) {
    typeSchema = typeSchema.refine(mimeType => allowedMimeTypes.includes(mimeType.toLowerCase()), {
      message: intl.formatMessage(INVALID_TYPE_ERROR, {
        allowedTypes: formattedTypeLabels(intl, allowedTypesLabels),
      }),
    });
  }

  return (
    z
      .object({
        // Formik state fields
        clientId: z.string().optional(),
        // see https://github.com/colinhacks/zod/discussions/1525 for the weird construct
        state: z
          .string()
          .refine(val => val === 'success', {
            message: intl.formatMessage({
              description:
                'File upload error message: only successful uploads can be submitted message.',
              defaultMessage: 'The upload must be completed before you can continue.',
            }),
          })
          .optional(),
        // Actual useful server-side data. Can be empty string, which Formik sends as
        // undefined.
        name: z.string().or(emptyString),
        originalName: z.string().min(3), // filename, . and extension
        size: sizeSchema,
        storage: z.literal('url'),
        type: typeSchema,
        // `blob://` protocol for temporary local urls, `http(s)://` for files persisted to
        // the backend.
        url: z.string().url(),
        // nested data object, copied over from Formio but we don't really know why they need
        // this in the first place? Might be polymorphic related to `storage`.
        data: z.object({
          // expected to be identical to the parent `url` property.
          url: z.string().url(),
          form: emptyString,
          name: z.string(), // not identical to parent property
          // identical to parent property, which is validated more strictly
          size: z.number().positive(),
          baseUrl: z.string(), // we don't really care what this value is
          project: emptyString,
        }),
      })
      // These are sanity checks - we don't expect this to ever be shown to users.
      .refine(
        value => {
          return value.url === value.data.url && value.size === value.data.size;
        },
        {
          message: intl.formatMessage({
            description: 'File upload schema validation: parent/child checks fail message',
            defaultMessage: 'The file upload (meta) data is not consistent.',
          }),
        }
      )
  );
};

const getValidationSchema: GetValidationSchema<FileComponentSchema> = (
  componentDefinition,
  {intl}
) => {
  const {
    key,
    validate = {},
    multiple,
    fileMaxSize = '',
    maxNumberOfFiles,
    file: fileTypeConfiguration,
  } = componentDefinition;
  const {required} = validate;

  const fileSchema = buildFileValidationSchema(
    intl,
    getSizeInBytes(fileMaxSize) ?? DEFAULT_MAX_SIZE,
    fileTypeConfiguration
  );

  let schema: z.ZodFirstPartySchemaTypes = z.array(fileSchema);

  // TODO: there's a backlog issue to merge/sort out the multiple/maxNumberOfFiles
  // possibly inconsistencies
  if (!multiple || maxNumberOfFiles != null) {
    const limit = maxNumberOfFiles ?? 1;
    schema = schema.max(limit, {
      message: intl.formatMessage(TOO_MANY_FILES_ERROR, {maxNumberOfFiles: limit}),
    });
  }

  if (required) {
    schema = schema.min(1);
  } else {
    schema = schema.optional();
  }
  return {[key]: schema};
};

export default getValidationSchema;
