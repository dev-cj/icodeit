import cn from 'classnames';
import React, { InputHTMLAttributes } from 'react';

const createClassName = ({ classNames = '', error, fullWidth }: any) => {
  const errorClassname = 'border-red-500';
  const className = cn(
    'text-base border rounded py-2 px-2 focus:outline-grey-400  placeholder-gray-600 transition duration-500 ease-in-out',
    error && errorClassname,
    fullWidth ? 'w-full' : 'w-auto',
    classNames
  );

  return className;
};

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  as: any;
  type: string;
  success: boolean;
  error: any;
  errorMsg: string;
  className: string;
  hideOutline: boolean;
  fullWidth: boolean;
  placeholder: string;
  inputProps: {};
  wrapperClassname: string;
}
const Input = React.forwardRef(
  (
    {
      as: Component,
      type = 'text',
      success,
      error = '',
      errorMsg = '',
      className = '',
      hideOutline = false,
      fullWidth = false,
      placeholder = '',
      inputProps = {},
      wrapperClassname = '',
      ...props
    }: Partial<Props>,
    ref
  ) => {
    const classNames = createClassName({
      classNames: className,
      error,
      fullWidth,
    });
    return (
      <div className={wrapperClassname}>
        <Component
          ref={ref}
          type={type}
          placeholder={placeholder}
          {...inputProps}
          {...props}
          className={classNames}
        />
        {error && errorMsg && (
          <div className='text-sm font-semibold text-red-500'>{errorMsg}</div>
        )}
      </div>
    );
  }
);

Input.defaultProps = {
  as: 'input',
  fullWidth: true,
};

export default Input;
