import React from 'react';
import { IconProps } from '~/common';

const JarvisIcon: React.FC<IconProps> = ({ size = 30, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"
        fill="currentColor"
      />
      <path
        d="M12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8Z"
        fill="currentColor"
      />
      <path
        d="M12 14C13.1 14 14 14.9 14 16C14 17.1 13.1 18 12 18C10.9 18 10 17.1 10 16C10 14.9 10.9 14 12 14Z"
        fill="currentColor"
      />
      <path
        d="M4 6C5.1 6 6 6.9 6 8C6 9.1 5.1 10 4 10C2.9 10 2 9.1 2 8C2 6.9 2.9 6 4 6Z"
        fill="currentColor"
      />
      <path
        d="M20 6C21.1 6 22 6.9 22 8C22 9.1 21.1 10 20 10C18.9 10 18 9.1 18 8C18 6.9 18.9 6 20 6Z"
        fill="currentColor"
      />
      <path
        d="M4 14C5.1 14 6 14.9 6 16C6 17.1 5.1 18 4 18C2.9 18 2 17.1 2 16C2 14.9 2.9 14 4 14Z"
        fill="currentColor"
      />
      <path
        d="M20 14C21.1 14 22 14.9 22 16C22 17.1 21.1 18 20 18C18.9 18 18 17.1 18 16C18 14.9 18.9 14 20 14Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default JarvisIcon; 