'use client';
import React, { useEffect, useState } from 'react';
import cn from 'classnames';

type Props = {
  children: React.ReactNode;
  show?: boolean;
  onHide: () => void;
};

const Transition = (props: Props) => {
  const { children, show, onHide } = props;

  const [backdropClasses, setBackdropClasses] = useState('opacity-0');
  const [transform, setTransform] = useState('opacity-0 scale-95');

  const updateTransition = (show: boolean | undefined) => {
    new Promise((r) => {
      setTimeout(() => {
        if (show) {
          setBackdropClasses('opacity-100');
          setTransform('opacity-100 scale-100');
        } else {
          setBackdropClasses('opacity-0');
          setTransform('opacity-0 scale-95');
        }
        r(null);
      }, 1);
    });
  };

  useEffect(() => {
    updateTransition(show);
  }, [show]);

  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) {
      return;
    }

    onHide();
  };

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 bottom-0 h-full w-full z-50 bg-black/90 transition-opacity',
        show ? 'ease-out duration-300' : 'ease-in duration-200',
        backdropClasses
      )}
      onClick={onBackdropClick}
    >
      <div
        className={cn(
          'relative flex justify-center max-w-full items-center mx-auto h-full',
          show ? 'ease-out duration-300' : 'ease-in duration-200',
          transform
        )}
        onClick={onBackdropClick}
      >
        {children}
      </div>
    </div>
  );
};

export default Transition;
