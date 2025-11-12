import {Heading2, SubtleButton, Icon as UtrechtIcon} from '@utrecht/component-library-react';
import {useEffect, useId, useRef} from 'react';
import ReactDOM from 'react-dom';
import {useIntl} from 'react-intl';

import Icon from '@/components/icons';

import './Modal.scss';
import {useModalContext} from './hooks';

export interface ModalProps {
  isOpen?: boolean;
  title: React.ReactNode;
  closeModal: () => void;
  children: React.ReactNode;
  noPortal?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen = false,
  title,
  closeModal,
  noPortal = false,
  children,
}) => {
  const titleId = useId();
  const intl = useIntl();
  const modalRef = useRef<HTMLDialogElement>(null);
  const {parentSelector} = useModalContext();

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

  const dialogUI = (
    <dialog
      className="openforms-modal"
      ref={modalRef}
      aria-labelledby={titleId}
      onClose={closeModal}
      onKeyDown={(event: React.KeyboardEvent<HTMLDialogElement>) => {
        // The `closedby="any"` should handle the "escape" key click in most cases.
        // This is still needed for storybook, and perhaps some older browsers.
        if (event.key === 'Escape') {
          closeModal();
        }
      }}
      // eslint-disable-next-line react/no-unknown-property
      closedby="any"
    >
      <header className="openforms-modal__header">
        <Heading2 id={titleId} className="openforms-modal__title">
          {title}
        </Heading2>
        <SubtleButton
          className="openforms-modal__close"
          type="button"
          onClick={closeModal}
          aria-label={intl.formatMessage({
            description: 'Modal close button title',
            defaultMessage: 'Close modal',
          })}
        >
          <UtrechtIcon>
            <Icon icon="close" />
          </UtrechtIcon>
        </SubtleButton>
      </header>

      <div className="openforms-modal__body">{children}</div>
    </dialog>
  );

  return noPortal ? dialogUI : ReactDOM.createPortal(dialogUI, parentSelector());
};

export default Modal;
