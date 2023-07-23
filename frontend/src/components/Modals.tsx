'use client';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { IS_BROWSER } from '@/shared/utils';
import Transition from './Transition';

type Props = {
  children: React.ReactNode;
  show?: boolean;
  onClose: () => void;
  close?: boolean;
};

const Modal = ({ show, onClose, children }: Props) => {
  const modalDocument = IS_BROWSER && document.getElementById('modals');

  const [mount, setMount] = useState(show);

  if (!modalDocument) {
    return null;
  }

  useEffect(() => {
    if (show) {
      setMount(true);
    } else {
      setTimeout(() => {
        setMount(false);
      }, 300);
    }
  }, [show]);

  return ReactDOM.createPortal(
    <>
      {mount ? (
        <Transition show={show} onHide={onClose}>
          {children}
        </Transition>
      ) : null}
    </>,
    modalDocument
  );
};

export default Modal;
