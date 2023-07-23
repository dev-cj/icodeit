import React from 'react';
import cn from 'classnames';

type Props = {
  className?: string;
};

const AppLogo = (props: Props) => {
  return (
    <div
      className={cn(
        'text-white font-semibold text-2xl flex items-center justify-center',
        props.className
      )}
    >
      icodeit
    </div>
  );
};

export default AppLogo;
