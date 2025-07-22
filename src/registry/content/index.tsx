import type {ContentComponentSchema} from '@open-formulieren/types';
import {HTMLContent} from '@utrecht/component-library-react';
import clsx from 'clsx';
import DOMPurify from 'dompurify';

import type {RegistryEntry} from '@/registry/types';

import './Content.scss';

export interface FormioContentProps {
  componentDefinition: ContentComponentSchema;
}

/**
 * A component to display HTML content.
 */

export const FormioContent: React.FC<FormioContentProps> = ({
  componentDefinition: {html, customClass},
}) => {
  const sanitizedContent = DOMPurify.sanitize(html);
  const className = clsx('openforms-formio-content', {
    [`openforms-formio-content--${customClass}`]: !!customClass,
  });

  return <HTMLContent className={className} dangerouslySetInnerHTML={{__html: sanitizedContent}} />;
};

const ContentComponent: RegistryEntry<ContentComponentSchema> = {
  formField: FormioContent,
};

export default ContentComponent;
