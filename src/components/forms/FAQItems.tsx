import type {FAQItem as FAQItemType} from '@open-formulieren/types';
import {HTMLContent, LinkButton, Icon as UtrechtIcon} from '@utrecht/component-library-react';
import Modal from 'components/modal';
import DOMPurify from 'dompurify';
import {useMemo, useState} from 'react';

import Icon from '@/components/icons';

import './FAQItem.scss';

export interface FAQItemsProps {
  /**
   * FAQ tooltips to provide additional information that is not crucial but may
   * assist users in filling out the field correctly.
   */
  items: FAQItemType[];
}

export interface FAQItemProps {
  label: string;
  content: string;
}

const FAQItem: React.FC<FAQItemProps> = ({label, content}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(content, {USE_PROFILES: {html: true}});
  }, [content]);
  const modalSheet = (
    <Modal title={label} variant="sheet" closeModal={() => setIsOpen(false)} isOpen={isOpen}>
      <HTMLContent dangerouslySetInnerHTML={{__html: sanitizedContent}} />
    </Modal>
  );

  return (
    <>
      <LinkButton className="openforms-faq-item" onClick={() => setIsOpen(true)}>
        <UtrechtIcon>
          <Icon icon="tooltip" />
        </UtrechtIcon>

        <span className="openforms-faq-item__title">{label}</span>
      </LinkButton>
      {modalSheet}
    </>
  );
};

const FAQItems: React.FC<FAQItemsProps> = ({items}) => {
  if (!items.length) return null;

  const faqElements = items.map(({label, content}, index) => (
    <FAQItem key={index} label={label} content={content} />
  ));
  return <div className="openforms-faq-items">{faqElements}</div>;
};

export default FAQItems;
