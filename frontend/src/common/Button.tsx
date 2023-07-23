import React, { useState } from 'react';
import cn from 'classnames';

import { CgSpinner } from 'react-icons/cg';

const Loader = ({
  style = {},
  className = 'w-6 h-6',
  color = 'text-white',
}) => {
  return (
    <CgSpinner
      className={cn('animate-spin', className, color)}
      style={{ ...style }}
    />
  );
};

interface ButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const Button = ({
  onClick = (e) => {},
  disabled = false,
  children,
  className,
  ...props
}: ButtonProps) => {
  const [executing, setExecuting] = useState(false);
  const onRealClick = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (onClick && !disabled) {
      setExecuting(true);
      await onClick(event);
      setExecuting(false);
    }
  };
  return (
    <button
      onClick={onRealClick}
      disabled={disabled || executing}
      {...props}
      className={cn(
        'flex h-10 w-full items-center justify-center',
        `text-white bg-blue-500 px-5 py-0.5 rounded hover:bg-opacity-90 font-semibold border`,
        className
      )}
    >
      {executing && (
        <div className='mx-1'>
          <Loader />
        </div>
      )}
      <div>{children}</div>
    </button>
  );
};

export default Button;
