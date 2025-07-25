import React from 'react';
import { IconMapProps } from '~/common';

const EdieIcon: React.FC<IconMapProps> = ({ size = 30, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.1"/>
      <path
        d="M8 8H16M8 12H14M8 16H16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default EdieIcon; 