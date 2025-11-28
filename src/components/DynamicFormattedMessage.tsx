import type {MessageFormatElement} from '@formatjs/icu-messageformat-parser';
import {formatMessage as coreFormatMessage} from '@formatjs/intl';
import type {ResolvedIntlConfig} from '@formatjs/intl/src/types';
import {DEFAULT_INTL_CONFIG} from '@formatjs/intl/src/utils';
import DOMPurify from 'dompurify';
import type {FormatXMLElementFn, PrimitiveType} from 'intl-messageformat';
import React, {useId, useMemo} from 'react';
import type {MessageDescriptor} from 'react-intl';
import {useIntl} from 'react-intl';

type MessageValues<T = React.ReactNode | PrimitiveType | FormatXMLElementFn<React.ReactNode>> =
  Record<string, T>;

export interface DynamicFormattedMessageProps {
  description: string | object;
  defaultMessage: string | MessageFormatElement[];
  values?: MessageValues;
  /**
   * Treat the message as HTML, sanitizing and pre-processing for rich text display.
   */
  asHtml?: boolean;
}

// List of HTML tags that are automatically transformed to HTML elements.
const ALLOWED_HTML_TAGS: MessageValues<FormatXMLElementFn<React.ReactNode>> = {
  p: chunks => <p>{chunks}</p>,
  br: () => <br />,
  b: chunks => <b>{chunks}</b>,
  strong: chunks => <strong>{chunks}</strong>,
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
  asHtml,
  values,
}) => {
  const id = useId();
  // Fetch the intl config, and use it for the Wrapper
  const intl = useIntl();

  const {message, values: extraValues} = useMemo(() => {
    if (!asHtml || typeof defaultMessage !== 'string') return {message: defaultMessage, values: {}};
    return preProcessHtml(defaultMessage);
  }, [asHtml, defaultMessage]);

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
      defaultMessage: message,
    } satisfies MessageDescriptor,
    {...values, ...extraValues}
  ) as React.ReactNode | React.ReactNode[];

  // FIXME: warnings about missing key for items in array
  if (Array.isArray(chunks)) {
    return React.Children.toArray(chunks);
  }
  return chunks;
};

/**
 * Pre-process an HTML string (from WYSIWYG editor) into a message suitable for
 * react-intl.
 *
 * Plain tags without attributes work as-is, but any attributes (like `style` on `p`
 * elements) choke the parser. Similarly, anchor elements require some attributes to
 * be useful that *will* be set from the rich text editor, and void ("self-closing")
 * elements (notably `<br>`) can occur and must be supported (see:
 * https://developer.mozilla.org/en-US/docs/Glossary/Void_element).
 *
 * The HTML string is first sanitized through DOMPurify and then parsed using the
 * browser APIs. The result is a message string that should be robust enough to feed
 * to react-intl.
 */
const preProcessHtml = (html: string): {message: string; values: MessageValues} => {
  const sanitizedHtml = DOMPurify.sanitize(html);

  // parse the HTML and treat SUPPORTED tags. Check the WYSIWYG element config/toolbar
  // for the reference on possible tags.
  // TODO: use a rich text content like prose-mirror that exposes JSON instead of HTML.
  const parser = new DOMParser();
  const body = parser.parseFromString(sanitizedHtml, 'text/html').body;
  const values: MessageValues = {};
  let counter = 0; // track unique suffixes for 'tag names'

  // Node visitor to walk the parsed HTML tree and process each element/node.
  const processNode = (node: ChildNode): string => {
    switch (node.nodeType) {
      case Node.TEXT_NODE: {
        return node.textContent ?? '';
      }
      case Node.ELEMENT_NODE: {
        if (!(node instanceof HTMLElement)) throw new Error('Expected HTMLElement');

        // process allowlist of supported tags, transforming into 'evaluation values'
        // as necessary
        const tag = node.tagName.toLowerCase();
        switch (tag) {
          // simple formatting tags - we don't expect any attributes here
          case 'b':
          case 'strong':
          case 'u':
          case 'i':
          case 'em': {
            return node.outerHTML;
          }
          // void elements - self-closing tags are not supported in react-intl formatting
          case 'br': {
            return '<br></br>';
          }
          // markup/content elements
          case 'p':
          case 'span': {
            // TODO extract + apply attributes!
            const childContent = process(node);
            return `<${tag}>${childContent}</${tag}>`;
          }
          // links, often used in WYSIWYG content
          case 'a': {
            const newTag = `link${counter++}`;
            const attrs = Object.fromEntries(
              node.getAttributeNames().map(attr => [attr, node.getAttribute(attr)])
            );
            values[newTag] = chunks => (
              <a target="_blank" {...attrs}>
                {chunks}
              </a>
            );
            const linkContent = process(node);
            return `<${newTag}>${linkContent}</${newTag}>`;
          }
        }

        // recurse into child elements, yielding at-minimum the text content
        return process(node);
      }
      default: {
        return '';
      }
    }
  };

  const process = (node: Node): string => [...node.childNodes].map(processNode).join('');

  const message = process(body).trim();
  return {message, values};
};

export default DynamicFormattedMessage;
