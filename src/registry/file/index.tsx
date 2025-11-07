import type {FileComponentSchema} from '@open-formulieren/types';
import {Suspense, lazy} from 'react';

import type {RegistryEntry} from '@/registry/types';

import type {FormioFileProps} from './File';
import './File.scss';
import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

const LazyFormioFile = lazy(() => import('./File'));

/**
 * Lazy wrapper with Suspense to optimize bundle chunks.
 *
 * The actual form field implementation lives in `File.tsx`, which we lazy load to avoid
 * loading unnecessary dependencies if a form does not use file components.
 */
const FormField: React.FC<FormioFileProps> = props => (
  <Suspense>
    <LazyFormioFile {...props} />
  </Suspense>
);

const FileComponent: RegistryEntry<FileComponentSchema> = {
  formField: FormField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default FileComponent;
