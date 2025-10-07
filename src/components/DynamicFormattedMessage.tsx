import type {MessageFormatElement} from '@formatjs/icu-messageformat-parser';
import {formatMessage as coreFormatMessage} from '@formatjs/intl';
import type {ResolvedIntlConfig} from '@formatjs/intl/src/types';
import {DEFAULT_INTL_CONFIG} from '@formatjs/intl/src/utils';
import type {FormatXMLElementFn, PrimitiveType} from 'intl-messageformat';
import React, {useId} from 'react';
import type {MessageDescriptor} from 'react-intl';
import {useIntl} from 'react-intl';

export interface DynamicFormattedMessageProps {
  description: string | object;
  defaultMessage: string | MessageFormatElement[];
  values?: Record<string, React.ReactNode | PrimitiveType | FormatXMLElementFn<React.ReactNode>>;
}

// List of HTML tags that are automatically transformed to HTML elements.
const ALLOWED_HTML_TAGS: Record<string, (chunks: React.ReactNode[]) => React.ReactNode> = {
  p: chunks => <p>{chunks}</p>,
  b: chunks => <b>{chunks}</b>,
  u: chunks => <u>{chunks}</u>,
  i: chunks => <i>{chunks}</i>,
};

/**
 * A custom implementation of the react-intl `FormattedMessage` for dynamically defined
 * messages.
 *
 * The react-intl `FormattedMessage` (and `useIntl().formatMessage`, for that matter),
 * don't allow dynamic messages, as they require the messages to be statically
 * evaluable https://github.com/formatjs/babel-plugin-react-intl/issues/119.
 * This custom implementation bypasses the evaluation, allowing dynamic messages.
 *
 * For rendering translations, you should use `FormattedMessage` or
 * `useIntl().formatMessage`. DynamicFormattedMessage should only be used for more
 * dynamic situations, like rendering rich text.
 */
const DynamicFormattedMessage: React.FC<DynamicFormattedMessageProps> = ({
  description,
  defaultMessage,
  values,
}) => {
  const id = useId();
  // Fetch the intl config, and use it for the Wrapper
  const intl = useIntl();

  const resolvedConfig: ResolvedIntlConfig<React.ReactNode> = {
    ...DEFAULT_INTL_CONFIG,
    ...intl,
    defaultRichTextElements: {
      ...intl.defaultRichTextElements,
      ...ALLOWED_HTML_TAGS,
    },
  };

  const chunks = coreFormatMessage(
    resolvedConfig,
    intl.formatters,
    {
      id,
      description,
      defaultMessage,
    } satisfies MessageDescriptor,
    values
  ) as React.ReactNode | React.ReactNode[];

  if (Array.isArray(chunks)) {
    return React.Children.toArray(chunks);
  }
  return chunks;
};
export default DynamicFormattedMessage;
