import {Heading1, SubtleButton} from '@utrecht/component-library-react';
import {useEffect, useId, useRef} from 'react';
import {useIntl} from 'react-intl';

import Icon from '@/components/icons';

import './Modal.scss';

export interface ModalProps {
  isOpen?: boolean;
  title?: React.ReactNode;
  closeModal: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({isOpen = false, title, closeModal, children}) => {
  const id = useId();
  const intl = useIntl();
  const modalRef = useRef<HTMLDialogElement>(null);

  // To open the dialog as a modal, we need to trigger its javascript functions.
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) {
      return;
    }

    if (isOpen) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [isOpen]);

  return (
    <dialog
      className="openforms-modal"
      ref={modalRef}
      aria-labelledby={title ? id : undefined}
      onClose={closeModal}
      // eslint-disable-next-line react/no-unknown-property
      closedby="any"
    >
      {title && (
        <Heading1 id={id} className="openforms-modal__title">
          {title}
        </Heading1>
      )}

      <SubtleButton
        className="openforms-modal__close"
        type="button"
        onClick={closeModal}
        aria-label={intl.formatMessage({
          description: 'Modal close button title',
          defaultMessage: 'Close modal',
        })}
      >
        <Icon icon="close" aria-hidden />
      </SubtleButton>

      <div className="openforms-modal__body">{children}</div>
    </dialog>
  );
};

export default Modal;
